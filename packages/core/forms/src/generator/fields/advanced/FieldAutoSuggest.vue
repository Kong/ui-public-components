<template>
  <div class="field-wrap autosuggest">
    <KSelect
      :id="schema.model"
      ref="suggestion"
      v-model="value"
      clearable
      enable-filtering
      :filter-function="() => true"
      :items="items"
      :loading="loading"
      :placeholder="schema.placeholder"
      width="100%"
      @change="onSelected"
      @query-change="onQueryChange"
    >
      <template #item-template="{item}">
        <span
          class="first-part"
          :data-testid="item.id && `${item.id}-0`"
          :data-testlabel="item.label"
        >
          {{ getSuggestionLabel(item).split(' - ')[0] }}
        </span>
        <span
          v-for="(field, idx) in getSuggestionLabel(item).split(' - ').slice(1)"
          :key="idx"
          class="field-span"
          :data-testid="(item.id && `${item.id}-${idx + 1}`) || idx + 1"
        >
          {{ field }}
        </span>
      </template>
      <template #empty>
        <div class="autosuggest__results_message">
          <span>{{ message }}</span>
        </div>
      </template>
    </KSelect>
  </div>
</template>

<script setup lang="ts">
import type { AxiosResponse } from 'axios'
import debounce from 'lodash-es/debounce'
import type { AbstractFieldComponentProps } from 'src/composables/useAbstractFields'
import { inject, ref, watch } from 'vue'
import useAbstractFields from '../../../composables/useAbstractFields'
import { FORMS_API_KEY } from '../../../const'
import { isValidUuid } from '../../utils/isValidUuid'
import type { FormAPIClient } from '../inject'

const REQUEST_RESULT_LIMIT = 50

const apiClient = inject<FormAPIClient>(FORMS_API_KEY)

const props = defineProps<AbstractFieldComponentProps>()

const { value, updateModelValue, clearValidationErrors } = useAbstractFields(props)

defineExpose({
  clearValidationErrors,
})

const message = ref('Type something to search')
const items = ref<any[]>([])
const loading = ref(false)

let performSearch: ((query: string) => void) | undefined

watch(value, async (newValue) => {
  if (!newValue) {
    items.value = []
    return
  }

  if (apiClient === undefined) {
    console.warn('[@kong-ui-public/forms] No API service provided')
    return
  }

  // Get entity data from API. In most cases the data is stored in the `data` key of the response directly
  // but sometimes it is stored in a nested key inside the `data` key, so we allow the user to specify it in the schema
  // e.g. entity data returned from `consumer_groups/:id` is stored in `data.consumer_group`
  const entityData = (await apiClient.getOne(props.schema.entity, newValue)).data
  const presetEntity = getItem(props.schema.entityDataKey ? entityData[props.schema.entityDataKey] : entityData)

  try {
    if (presetEntity) {
      items.value = [{ ...presetEntity, label: getSuggestionLabel(presetEntity), value: presetEntity.id }]
    }
  } catch (err) {
    message.value = `There was an error loading ${props.schema.entity}`
    console.error('err!', err)
  }
}, { immediate: true })

const onQueryChange = (query: string) => {
  if (query.trim().length === 0) {
    items.value = []
    message.value = 'Type something to search'
  }

  if (typeof performSearch !== 'function') {
    performSearch = debounce(search, 500)
  }

  performSearch(query)
}

const search = async (query: string) => {
  if (query.trim().length === 0) {
    return
  }

  loading.value = true
  const newItems: any[] = []
  const promises: Promise<any>[] = []
  const fields = getInputFields()
  const filteredIds = new Set()

  // If query is a valid UUID, do the exact search
  if (isValidUuid(query) && fields.includes('id')) {
    promises.push((async () => {
      const item = await fetchExact(query)

      newItems.push({ ...item, label: getSuggestionLabel(item), value: item.id })
    })())
  } else {
    // Search on fields with backend filtering support
    promises.push(...fields.filter((field) => field !== 'id').map(async (field) => {
      const result = await fetchSuggestions(query, field)
      result.forEach((item) => {
        if (!filteredIds.has(item.id)) {
          filteredIds.add(item.id)
          newItems.push({ ...item, label: getSuggestionLabel(item), value: item.id })
        }
      })
    }))
  }

  await Promise.all(promises)

  items.value = newItems
  if (items.value.length === 0) {
    message.value = 'No results'
  }

  loading.value = false
}

const getItem = (data: AxiosResponse<any[]>) => {
  if (data.data) {
    return data.data.length > 0 ? data.data[0] : []
  }

  return data
}

const fetchUntilLimit = async (params?: Record<string, any>) => {
  const data = []
  let offset = null

  if (apiClient === undefined) {
    console.warn('[@kong-ui-public/forms] No API service provided')
    return []
  }

  while (data.length < REQUEST_RESULT_LIMIT) {
    const res = await apiClient.getAll(props.schema.entity, {
      size: REQUEST_RESULT_LIMIT > 1000 ? 1000 : REQUEST_RESULT_LIMIT,
      offset,
      ...params,
    })

    data.push(...res.data.data)
    offset = res.data.offset
    if (!offset) break
  }

  return data.slice(0, REQUEST_RESULT_LIMIT)
}

const fetchSuggestions = async (query: string, field: string) => {
  return fetchUntilLimit({ [field]: query })
}

const fetchExact = async (id: string) => {
  if (apiClient === undefined) {
    console.warn('[@kong-ui-public/forms] No API service provided')
    return {}
  }
  const res = await apiClient.getOne(props.schema.entity, id)

  return res.data
}

const getInputFields = (): string[] => {
  return props.schema?.inputValues?.fields || []
}

const getSuggestionLabel = (item: Record<string, any>) => {
  const fields = getInputFields()

  return fields.length && item ? fields.map(field => item[field]).filter(Boolean).join(' - ') : ''
}

const onSelected = (item: Record<string, any>) => {
  updateModelValue(getReturnValue(item || {}), value.value)
}

const getReturnValue = (item: Record<string, any>) => {
  const returnKey = props.schema?.returnKey

  return returnKey ? item[returnKey] : item.id || null // keep null here
}
</script>

<style lang="scss" scoped>
.autosuggest  {
  width: 100%;
}
.k-select {
  border: none!important;
  padding: 0!important;

  .autosuggest__results_message {
    color: rgba(0, 0, 0, 0.7);
    font-size: 14px;
    padding: 8px 0;
    text-align: center;
  }

  .k-select-item-label span:last-child {
    opacity: 0.7;
  }
}

.field-span {
  display: flex;
  justify-content: space-between;
}
</style>

<style lang="scss">
.autosuggest .k-select {
  .k-select-list .k-select-item {
    button:active {
      box-shadow: none;

      &:not(.selected) {
        background-color: $kui-color-background-neutral-weakest;
      }
    }
  }
}
</style>

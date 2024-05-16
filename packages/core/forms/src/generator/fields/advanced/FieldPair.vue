<template>
  <div class="item-wrapper">
    <KLabel
      v-if="arrayInfo !== undefined && label"
      :aria-describedby="help ? valueTooltipA11yId : undefined"
      :for="valueInputA11yId"
      :info="help"
      :tooltip-attributes="help ? {
        maxWidth: '300',
        placement: 'top',
        tooltipId: valueTooltipA11yId
      } : undefined"
    >
      {{ label }}
    </KLabel>

    <div class="input-wrapper">
      <div v-if="schema.insertText !== undefined && schema.insertText.leading">
        {{ schema.insertText.leading }}
      </div>
      <KInput
        :model-value="value[0]"
        v-bind="schema.inputAttributes && schema.inputAttributes.former"
        type="number"
        @update:model-value="(s: string) => value = [s, value[1]]"
      />
      <div v-if="schema.insertText !== undefined && schema.insertText.middle">
        {{ schema.insertText.middle }}
      </div>
      <KInput
        :model-value="value[1]"
        type="text"
        v-bind="schema.inputAttributes?.latter"
        @update:model-value="(s: string) => value = [value[0], s]"
      />
      <div v-if="schema.insertText !== undefined && schema.insertText.trailing">
        {{ schema.insertText.trailing }}
      </div>

      <div
        v-if="arrayInfo !== undefined"
        class="action-buttons"
      >
        <KButton
          appearance="tertiary"
          :disabled="arrayInfo.size <= 1"
          @click="() => props.arrayInfo && emit('remove-item', props.arrayInfo.index)"
        >
          <RemoveIcon />
        </KButton>
        <KButton
          appearance="tertiary"
          @click="() => props.arrayInfo && emit('add-item', props.arrayInfo.index)"
        >
          <AddIcon />
        </KButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AddIcon, RemoveIcon } from '@kong/icons'
import { computed, toRefs } from 'vue'
import composables from '../../../composables'
import type { PairFieldSchema, PairFieldValue } from '../types/pair'

const props = defineProps<{
  vfg: any
  model: Record<string, any>
  schema: PairFieldSchema
  formOptions?: Record<string, any>

  formModel?: Record<string, any>

  /**
   * This prop will be set when the field is nested inside an array field.
   */
  arrayInfo?: {
    index: number
    size: number
  }
}>()

const emit = defineEmits<{
  'model-updated': [value: PairFieldValue, modelKey: string, index?: number]
  'add-item': [index: number]
  'remove-item': [index: number]
}>()

const propsRefs = toRefs(props)

const { value, clearValidationErrors } = composables.useAbstractFields<PairFieldValue>({
  model: propsRefs.model,
  schema: props.schema,
  formOptions: props.formOptions,
  emitModelUpdated: (data) => {
    props.schema.pairSet(data.value, props.formModel ?? props.model, props.arrayInfo?.index)
  },
})

defineExpose({
  clearValidationErrors,
})

const label = computed(() => {
  if (typeof props.schema.formatLabel === 'function' && props.arrayInfo !== undefined) {
    return props.schema.formatLabel(props.arrayInfo.index, value.value)
  }
  return props.schema.label
})

const help = computed(() => {
  if (typeof props.schema.formatHelp === 'function' && props.arrayInfo !== undefined) {
    return props.schema.formatHelp(props.arrayInfo.index, value.value)
  }
  return props.schema.help
})

const valueTooltipA11yId = computed(() =>
  `pair-${Math.random().toString(36).substring(2)}-tooltip-${props.arrayInfo?.index ?? '0'}`,
)

const valueInputA11yId = computed(() =>
  `pair-${Math.random().toString(36).substring(2)}-value-${props.arrayInfo?.index ?? '0'}`,
)
</script>

<style lang="scss" scoped>
.item-wrapper {
  flex-grow: 1;

  .input-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: $kui-space-60;

    .action-buttons {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
}
</style>

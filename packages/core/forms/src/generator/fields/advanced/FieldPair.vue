<template>
  <div class="item-wrapper">
    <KLabel
      v-if="parentArray !== undefined && label"
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
        @update:model-value="(s: string) => updateModelValue([s, value[1]], value)"
      />
      <div v-if="schema.insertText !== undefined && schema.insertText.middle">
        {{ schema.insertText.middle }}
      </div>
      <KInput
        :model-value="value[1]"
        type="text"
        v-bind="schema.inputAttributes?.latter"
        @update:model-value="(s: string) => updateModelValue([value[0], s], value)"
      />
      <div v-if="schema.insertText !== undefined && schema.insertText.trailing">
        {{ schema.insertText.trailing }}
      </div>

      <div
        v-if="parentArray !== undefined"
        class="action-buttons"
      >
        <KButton
          appearance="tertiary"
          :disabled="parentArray.size <= 1"
          @click="() => props.parentArray && emit('remove-item', props.parentArray.index)"
        >
          <RemoveIcon />
        </KButton>
        <KButton
          appearance="tertiary"
          @click="() => props.parentArray && emit('add-item', props.parentArray.index)"
        >
          <AddIcon />
        </KButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AddIcon, RemoveIcon } from '@kong/icons'
import { computed } from 'vue'
import useAbstractFields from '../../../composables/useAbstractFields'
import type { ArrayFieldItemFieldProps } from '../types/array'
import type { PairFieldSchema, PairFieldValue } from '../types/pair'

const props = defineProps<{
  vfg: any
  model: Record<string, any>
  schema: PairFieldSchema
  formOptions?: Record<string, any>
} & ArrayFieldItemFieldProps>()

const emit = defineEmits<{
  'model-updated': [value: PairFieldValue, modelKey?: string, index?: number]
  'add-item': [index: number]
  'remove-item': [index: number]
}>()

const { value, updateModelValue, clearValidationErrors } = useAbstractFields<PairFieldValue>(props, {
  emitModelUpdated: (data) => {
    emit('model-updated', data.value, data.modelKey)
  },
})

defineExpose({
  clearValidationErrors,
})

const label = computed(() => {
  if (typeof props.schema.formatLabel === 'function' && props.parentArray !== undefined) {
    return props.schema.formatLabel(props.parentArray.index, value.value)
  }
  return props.schema.label
})

const help = computed(() => {
  if (typeof props.schema.formatHelp === 'function' && props.parentArray !== undefined) {
    return props.schema.formatHelp(props.parentArray.index, value.value)
  }
  return props.schema.help
})

const valueTooltipA11yId = computed(() =>
  `pair-${Math.random().toString(36).substring(2)}-tooltip-${props.parentArray?.index ?? '0'}`,
)

const valueInputA11yId = computed(() =>
  `pair-${Math.random().toString(36).substring(2)}-value-${props.parentArray?.index ?? '0'}`,
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

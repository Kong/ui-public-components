<template>
  <div>
    <KSelect
      v-model="selectedTraceId"
      :items="traceSelectItems"
      label="Trace"
    />
  </div>

  <div class="span-flow">
    <VueFlow
      fit-view-on-init
      :nodes-connectable="false"
      :nodes-draggable="false"
    >
      <MiniMap />
      <Controls :show-interactive="false" />
      <Background />
    </VueFlow>
  </div>
</template>

<script lang="ts" setup>
import type { SelectItem } from '@kong/kongponents'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import {
  useVueFlow,
  VueFlow,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { computed, nextTick, ref, watch } from 'vue'
import { useLayout } from '../composables/use-layout'
import traceDataNested from '../trace-nested.json'
import type { ExtendedNode, TraceGraph } from '../types'
import { buildTraceGraphs } from '../utils'

const {
  fitView,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  updateNode,
  onNodesInitialized,
  onNodeClick,
} = useVueFlow()

const layout = useLayout({
  maxWidth: 600,
  nodeGapX: 20,
  nodeGapY: 20,
})

const traceGraphs = computed(() => buildTraceGraphs(traceDataNested.data))

const traceSelectItems = computed<SelectItem[]>(() =>
  Array.from(traceGraphs.value.keys()).map((id) => ({ label: id, value: id })),
)

const selectedTraceId = ref(traceSelectItems.value[0].value as string)
const currentGraph = ref<TraceGraph | undefined>()

watch(
  selectedTraceId,
  (traceId) => {
    const g = traceGraphs.value.get(traceId)
    currentGraph.value = g
  },
  { immediate: true },
)

onNodesInitialized((nodes) => {
  for (const diff of layout(nodes)) {
    updateNode(diff.id, diff)
  }
  nextTick(()=>{
    fitView()
  })
})

watch(
  currentGraph,
  (newGraph, oldGraph) => {
    removeNodes(oldGraph?.nodes ?? [])
    removeEdges(oldGraph?.edges ?? [])

    addNodes(newGraph?.nodes ?? [])
    addEdges(newGraph?.edges ?? [])
  },
  { immediate: true },
)

onNodeClick((e: NodeMouseEvent) => {
  const node = e.node as ExtendedNode

  switch (node.data?.extendedType) {
    case 'span': {
      if (node.data?.child) {
        currentGraph.value = node.data?.child
      }
      break
    }
    case 'parent': {
      if (node.data.parent) {
        currentGraph.value = node.data.parent
      }
      break
    }
  }
})
</script>

<style lang="scss">
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/node-resizer/dist/style.css";
@import "@vue-flow/controls/dist/style.css";
@import "@vue-flow/minimap/dist/style.css";

@import "@vue-flow/core/dist/theme-default.css";

.span-flow {
  width: 100%;
  height: 600px;
}

.vue-flow__node {
  word-wrap: break-word;
  width: auto;
  font-family: monospace;
}
</style>

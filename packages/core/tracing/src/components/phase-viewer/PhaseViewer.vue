<template>
  <div class="phase-viewer">
    <VueFlow
      :nodes-connectable="false"
      :nodes-draggable="false"
    >
      <template #node-default="props: NodeProps<PhaseNodeData>">
        <PhaseViewerNode
          :data="props.data"
          :source-position="props.sourcePosition"
          :target-position="props.targetPosition"
        />
      </template>

      <PhaseViewerLegend ref="legend" />

      <Controls :show-interactive="false" />
      <Background />
    </VueFlow>
  </div>
</template>

<script lang="ts" setup>
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import {
  Position,
  useVueFlow,
  VueFlow,
  type NodeProps,
} from '@vue-flow/core'
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import type { PhaseGraph, PhaseNode, PhaseNodeData } from '../../types'
import { buildPhaseGraph } from '../../utils'
import PhaseViewerLegend from './PhaseViewerLegend.vue'
import PhaseViewerNode from './PhaseViewerNode.vue'
import { KUI_SPACE_40 } from '@kong/design-tokens'

const legendRef = useTemplateRef<HTMLElement>('legend')

const options = {
  nodeGapX: 30,
  nodeGapY: 10,
}

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

const { findNode } = useVueFlow()

const layout = (nodes: PhaseNode[]): PhaseNode[] => {
  if (nodes.length === 0) {
    return []
  }

  const output = [...nodes]

  let x = 0
  let y = 0
  let maxHeight = 0
  const heights = []
  let upstreamIndex = -1

  for (let i = 0; i < output.length; i++) {
    const prev = i > 0 ? output[i - 1] : undefined
    const curr = output[i]

    const graphNode = findNode(curr.id)
    const width = graphNode?.dimensions.width ?? 0
    const height = graphNode?.dimensions.height ?? 0
    heights.push(height)

    switch (curr.data.direction) {
      case 'request':
        if (prev && prev.data.direction !== 'request') {
          throw new Error(`Invalid direction mutation: ${prev?.data.direction} -> ${curr.data.direction}`)
        }
        x += options.nodeGapX
        curr.position = { x, y }
        curr.targetPosition = Position.Left
        curr.sourcePosition = Position.Right
        x += width
        if (height > maxHeight) {
          maxHeight = height
        }
        break
      case 'upstream':
        if (prev?.data.direction !== 'request') {
          throw new Error(`Invalid direction mutation: ${prev?.data.direction} -> ${curr.data.direction}`)
        }

        for (let j = 0; j < i; j++) {
          const node = output[j]
          node.position = {
            x: node.position.x,
            y: maxHeight - heights[j],
          }
        }

        x += options.nodeGapX
        y += maxHeight + options.nodeGapY
        curr.position = { x, y }
        curr.targetPosition = Position.Top
        curr.sourcePosition = Position.Bottom
        y += height + options.nodeGapY
        maxHeight = 0
        upstreamIndex = i
        break
      case 'response':
        if (prev?.data.direction !== 'upstream' && prev?.data.direction !== 'response') {
          throw new Error(`Invalid direction mutation: ${prev?.data.direction} -> ${curr.data.direction}`)
        }

        x -= width + options.nodeGapX
        curr.position = { x, y }
        curr.targetPosition = Position.Right
        curr.sourcePosition = Position.Left
        if (height > maxHeight) {
          maxHeight = height
        }
        break
    }
  }

  if (upstreamIndex >= 0) {
    for (let i = upstreamIndex; i < output.length; i++) {
      const node = output[i]
      node.position = {
        x: node.position.x,
        y: node.position.y + (maxHeight - heights[i]),
      }
    }
  }

  return output
}

const currentGraph = ref<PhaseGraph>(buildPhaseGraph([{
  label: 'TLS Handshake',
  durationNano: 2 * 1e6,
  direction: 'request',
}, {
  label: 'OIDC Plugin',
  durationNano: 1 * 1e6,
  direction: 'request',
}, {
  label: 'Rate Limiting Plugin',
  durationNano: 1 * 1e6,
  direction: 'request',
}, {
  label: 'DNS Resolution',
  durationNano: 2 * 1e6,
  direction: 'request',
}, {
  label: 'Upstream Connection',
  durationNano: 25 * 1e6,
  direction: 'upstream',
}, {
  label: 'Jq Plugin',
  durationNano: 5 * 1e6,
  direction: 'response',
}, {
  label: 'Response Transformer Plugin',
  durationNano: 1 * 1e6,
  direction: 'response',
}]))

onNodesInitialized((nodes) => {
  for (const diff of layout(nodes)) {
    updateNode(diff.id, diff)
  }
  nextTick(() => {
    fitNodes()
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

const fitNodes = () => {
  const padding = (legendRef.value?.getBoundingClientRect?.()?.height ?? 0) + 2 * parseFloat(KUI_SPACE_40)
  fitView({
    offset: {
      y: -padding,
    },
    minZoom: 0.1,
  })
}

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    fitNodes()
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

// onNodeClick((e: NodeMouseEvent) => {
//   const node = e.node as ExtendedNode

//   switch (node.data?.extendedType) {
//     case 'span': {
//       if (node.data?.child) {
//         currentGraph.value = node.data?.child
//       }
//       break
//     }
//     case 'parent': {
//       if (node.data.parent) {
//         currentGraph.value = node.data.parent
//       }
//       break
//     }
//   }
// })
</script>

<style lang="scss">
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/node-resizer/dist/style.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';

@import '@vue-flow/core/dist/theme-default.css';

.phase-viewer {
  width: 100%;
  height: 300px;
}

.vue-flow__node {
  border-radius: $kui-border-radius-30;
  border: $kui-border-width-10 solid black;
  box-shadow: 0 2px 4px #00000010;
  padding: 0;
  width: auto;
  word-wrap: break-word;
}
</style>

import { MarkerType, type Edge, type Node } from '@vue-flow/core'
import type { PhaseGraph, PhaseNode, PhaseNodeData } from 'src/types'

export const buildPhaseGraphEdges = (nodes: Node[]): Edge[] => {
  const edges: Edge[] = []
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `e${nodes[i].id}->${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'smoothstep',
      // animated: true,
      markerEnd: MarkerType.ArrowClosed,
    })
  }
  return edges
}

export const buildPhaseGraph = (nodeData: PhaseNodeData[]): PhaseGraph => {
  const nodes: PhaseNode[] = nodeData.map((data, i) => ({
    id: `${i}`,
    position: { x: 0, y: 0 },
    data,
  }))
  const edges = buildPhaseGraphEdges(nodes)

  return { nodes, edges }
}

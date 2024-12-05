import type { Edge, Node } from '@vue-flow/core'
import type { Span } from './spans'

export type PhaseNodeDirection = 'request' | 'upstream' | 'response'

export interface PhaseNodeData {
  label: string
  durationNano: number
  direction: PhaseNodeDirection
  spans?: Span[]
}

export interface PhaseNode extends Node<PhaseNodeData, any, PhaseNodeDirection> {
  // Overriding as we will always provide the node data
  data: PhaseNodeData
}

export interface PhaseGraph {
  nodes: PhaseNode[]
  edges: Edge[]
}

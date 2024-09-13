import { Position, useVueFlow, type Node } from '@vue-flow/core'
import type { ExtendedNode } from 'src/types'

export interface LayoutOptions {
  maxWidth?: number;
  nodeGapX?: number;
  nodeGapY?: number;
}

export type NodeLayoutDiff = Pick<Node, 'id' | 'position' | 'targetPosition' | 'sourcePosition'>

export const useLayout = (options?: LayoutOptions) => {
  const { findNode } = useVueFlow()

  return (nodes: ExtendedNode[]): NodeLayoutDiff[] => {
    const direction: 'LR' | 'RL' = 'LR'
    let x = 0
    const y = 0
    let maxRowHeight = 0

    const nodeDiffs: NodeLayoutDiff[] = []

    for (const node of nodes) {
      const graphNode = findNode(node.id)
      const width = graphNode?.dimensions.width ?? 0
      const height = graphNode?.dimensions.height ?? 0

      nodeDiffs.push({
        id: node.id,
        position: {
          x: x,
          y: y,
        },
        targetPosition: direction === 'LR' ? Position.Left : Position.Right,
        sourcePosition: direction === 'LR' ? Position.Right : Position.Left,
      })

      if (height > maxRowHeight) {
        maxRowHeight = height
      }

      switch (direction) {
        case 'LR': {
          x += width + (options?.nodeGapX ?? 0)
          break
        }
      }
    }

    return nodeDiffs
  }
}

export const useLayout2 = (options?: LayoutOptions) => {
  const { findNode } = useVueFlow()
  const maxWidth = options?.maxWidth ?? 0

  return (nodes: Node[]): NodeLayoutDiff[] => {
    let direction: 'LR' | 'RL' = 'LR'
    let x = 0
    let y = 0
    let maxRowHeight = 0

    const nodeDiffs: NodeLayoutDiff[] = []

    for (const node of nodes) {
      const graphNode = findNode(node.id)
      const width = graphNode?.dimensions.width ?? 0
      const height = graphNode?.dimensions.height ?? 0

      // Check node overflow
      if (maxWidth > 0) {
        if (direction === 'LR' && x > maxWidth) {
          direction = 'RL'
          x = maxWidth
          y += maxRowHeight + (options?.nodeGapY ?? 0)
          maxRowHeight = 0
        } else if (direction === 'RL' && x < 0) {
          direction = 'LR'
          x = 0
          y += maxRowHeight + (options?.nodeGapY ?? 0)
          maxRowHeight = 0
        }
      }

      if (direction === 'RL') {
        x -= width
      }

      nodeDiffs.push({
        id: node.id,
        position: {
          x: x,
          y: y,
        },
        targetPosition: direction === 'LR' ? Position.Left : Position.Right,
        sourcePosition: direction === 'LR' ? Position.Right : Position.Left,
      })

      if (height > maxRowHeight) {
        maxRowHeight = height
      }

      switch (direction) {
        case 'LR': {
          x += width + (options?.nodeGapX ?? 0)
          break
        }
        case 'RL': {
          x -= options?.nodeGapX ?? 0
          break
        }
      }
    }

    return nodeDiffs
  }
}

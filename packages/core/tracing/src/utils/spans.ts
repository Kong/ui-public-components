import type { Span, SpanTreeNode } from '../types/spans'

export const buildSpanTrees = (spans: Span[]): SpanTreeNode[] => {
  const nodes = new Map<string, SpanTreeNode>()

  for (const span of spans) {
    nodes.set(span.spanId, {
      ...span,
      root: span.parentSpanId === '0000000000000000',
      durationNano: span.endTimeUnixNano - span.startTimeUnixNano,
      children: [],
    })
  }

  const roots: SpanTreeNode[] = []

  for (const node of nodes.values()) {
    if (!node.root) {
      const parent = nodes.get(node.parentSpanId)!
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  for (const node of nodes.values()) {
    node.children.sort((a, b) => a.startTimeUnixNano - b.startTimeUnixNano)
  }

  return roots
}

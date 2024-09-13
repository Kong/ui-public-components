import type { Span, SpanTreeNode, SpanTreeNodeLegacy, Trace } from './types'

const warn = (...args: Parameters<Console['warn']>) => {
  console.warn('[Trace Tree Builder]', ...args)
}

export const buildTraceTreeLegacy = (trace: Trace) => {
  const spanMap: Map<string, SpanTreeNodeLegacy> = new Map()

  // We need to find a root span
  let rootSpan: SpanTreeNodeLegacy | undefined

  // Build the map in the 1st pass
  for (const span of trace.spans) {
    const spanTreeNode = {
      ...span, // Do we need cloneDeep here?
      subtotalDuration: -1, // We will walk the tree later in another pass
    }
    spanMap.set(span.spanID, spanTreeNode)
    if (!Array.isArray(span.references) || span.references.length === 0) {
      if (rootSpan !== undefined) {
        warn('Found multiple possible root spans', { current: rootSpan, upcoming: span })
      }
      rootSpan = spanTreeNode
    }
  }

  if (rootSpan === undefined) {
    // Abort if we couldn't find a root span
    warn('No root span found')
    return
  }

  for (const span of trace.spans) {
    if (Array.isArray(span.references) && span.references.length >= 1) {
      if (span.references.length > 1) {
        warn('Found multiple references', { references: span.references, span })
      }
      const reference = span.references[0]
      if (reference.refType !== 'CHILD_OF') {
        warn(`Ignoring unsupported refType "${reference.refType}"`, { reference, span })
        continue
      }
      if (reference.traceID !== trace.traceID) {
        warn('Found reference to foreign trace', { reference,span })
        continue
      }
      const parent = spanMap.get(reference.spanID)
      if (parent === undefined) {
        warn('Found reference to non-existent span', { reference, span })
        continue
      }
      const self = spanMap.get(span.spanID)
      if (self === undefined) {
        // WTF error
        warn('Missing span in the map', { span })
        continue
      }
      if (!Array.isArray(parent.children)) {
        parent.children = []
      }
      parent.children.push(self)
    }
  }

  const finalWalk = (node: SpanTreeNodeLegacy) => {
    if (node.subtotalDuration >= 0) {
      return node.subtotalDuration
    }
    let subtotalDuration = node.duration
    if (Array.isArray(node.children)) {
      node.children.sort((a, b) => a.startTime - b.startTime)
      for (const child of node.children) {
        subtotalDuration += finalWalk(child)
      }
    }
    node.subtotalDuration = subtotalDuration
    return subtotalDuration
  }

  finalWalk(rootSpan)

  return rootSpan
}

export const buildSpanTrees = (spans: Span[]): SpanTreeNode[] => {
  const nodes = new Map<string, SpanTreeNode>()

  for (const span of spans) {
    nodes.set(span.spanId, {
      ...span,
      durationNano: span.endTimeUnixNano - span.startTimeUnixNano,
      children: [],
    })
  }

  const roots: SpanTreeNode[] = []

  for (const node of nodes.values()) {
    if (node.parentSpanId !== '0000000000000000') {
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

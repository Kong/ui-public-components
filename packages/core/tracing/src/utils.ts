import { MarkerType, type Edge, type Node } from '@vue-flow/core'
import type { ExtendedNode, Span, SpanNode, TraceData, TraceGraph } from './types'

export const buildEdges = (nodes: Node[]): Edge[] => {
  const edges: Edge[] = []
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `e${nodes[i].id}->${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: 'smoothstep',
      animated: true,
      markerEnd: MarkerType.ArrowClosed,
    })
  }
  return edges
}

export const buildEdgesRecursively = (nodes: ExtendedNode[]): Edge[] => {
  for (const n of nodes) {
    if (n.data?.extendedType === 'span' && n.data?.child) {
      n.data.child.edges = buildEdgesRecursively(n.data.child.nodes)
    }
  }
  return buildEdges(nodes)
}

export const setUpParentNodes = (nodes: ExtendedNode[], graph: TraceGraph, parentNode?: ExtendedNode, parentGraph?: TraceGraph): void => {
  for (const n of nodes) {
    if (n.data?.extendedType === 'span' && n.data?.child) {
      setUpParentNodes(n.data.child.nodes, n.data.child, n, graph)
    }
  }

  if (parentNode && nodes.length > 0 ) {
    nodes.unshift({
      id: `_start:${nodes[0].id}`,
      label: parentNode.label,
      position: { x: 0, y: 0 },
      type: 'input',
      data: {
        extendedType: 'parent',
        parent: parentGraph,
      },
    })
    nodes.push({
      id: `_end:${nodes[nodes.length - 1].id}`,
      label: parentNode.label,
      position: { x: 0, y: 0 },
      type: 'output',
      data: {
        extendedType: 'parent',
        parent: parentGraph,
      },
    })
  }
}

export const buildTraceGraphs = (traces: TraceData[]): Map<string, TraceGraph> => {
  const traceLookup = new Map<string, TraceData>()
  const spanLookup = new Map<string, Map<string, ExtendedNode>>()
  const spans: Span[] = []

  for (const trace of traces) {
    traceLookup.set(trace.traceID, trace)
    for (const span of trace.spans) {
      if (!spanLookup.has(span.traceID)) {
        spanLookup.set(span.traceID, new Map())
      }

      const node: ExtendedNode = {
        id: span.spanID,
        label: span.operationName,
        position: { x: 0, y: 0 }, // We will calculate them later
        data: {
          extendedType: 'span',
          span,
        },
      }

      spanLookup.get(span.traceID)?.set(span.spanID, node)
      spans.push(span)
    }
  }

  spans.sort((a, b) => a.startTime - b.startTime)

  const traceGraphs = new Map<string, TraceGraph>()

  for (const span of spans) {
    const node = spanLookup.get(span.traceID)?.get(span.spanID)
    if (!node) {
      throw new Error('node not found')
    }

    // Find root spans in the trace
    if (!span.references.some(ref => ref.refType === 'CHILD_OF' && ref.traceID === span.traceID)) {
      if (!traceGraphs.has(span.traceID)) {
        traceGraphs.set(span.traceID, {
          nodes: [],
          edges: [],
        })
      }
      traceGraphs.get(span.traceID)?.nodes.push(node)
    }

    for (const ref of span.references) {
      switch (ref.refType) {
        case 'CHILD_OF': {
          const parentNode = spanLookup.get(ref.traceID)?.get(ref.spanID)
          if (!parentNode) {
            throw new Error(`referenced node not found: trace=${ref.traceID} span=${ref.spanID}`)
          }
          if (parentNode.data?.extendedType === 'span') {
            if (!parentNode.data?.child) {
              parentNode.data!.child = {
                nodes: [],
                edges: [],
              }
            }
            parentNode.data!.child.nodes.push(node)
          }
          break
        }
      }
    }
  }

  for (const g of traceGraphs.values()) {
    setUpParentNodes(g.nodes, g)
    g.edges = buildEdgesRecursively(g.nodes)
  }

  return traceGraphs
}

export const buildSpanNodes = (spans: Span[]): SpanNode[] => {
  const lookup: Map<string, SpanNode> = new Map()
  const rootSpanNodes: SpanNode[] = []

  for (const span of spans.toSorted((a, b) => a.startTime - b.startTime)) {
    const spanNode: SpanNode = {
      node: {
        id: span.spanID,
        label: span.operationName,
        position: { x: 0, y: 0 },
      },
      span,
    }
    lookup.set(span.spanID, spanNode)
    rootSpanNodes.push(spanNode)

    if (span.parentSpanID) {
      const parent = lookup.get(span.parentSpanID)
      spanNode.node.parentNode = span.parentSpanID
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(spanNode)
      }
    }
  }

  rootSpanNodes.unshift({
    node: {
      id: '_request',
      label: 'Request',
      position: { x: 0, y: 0 },
      type: 'input',
    },
  })

  rootSpanNodes.push({
    node: {
      id: '_response',
      label: 'Response',
      position: { x: 0, y: 0 },
      type: 'output',
    },
  })

  return rootSpanNodes
}

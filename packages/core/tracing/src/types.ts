import type { Edge, Node } from '@vue-flow/core'

export interface Trace {
  data: TraceData[];
  total: number;
  limit: number;
  offset: number;
  errors: null;
}

export interface TraceData {
  traceID: string;
  spans: Span[];
  processes: {
    [key: string]: {
      serviceName: string;
      tags: Tag[];
    };
  };
  warnings: null;
}

export interface Span {
  traceID: string;
  spanID: string;
  operationName: string;
  references: Reference[];
  startTime: number;
  duration: number;
  tags: Tag[];
  logs: any[];
  processID: string;
  warnings: null;
}

export interface Reference {
  refType: string;
  traceID: string;
  spanID: string;
}

export interface Tag {
  key: string;
  type: string;
  value: string | number;
}

export type ExtendedNode = Node<{
  extendedType: 'span'
  span?: Span;
  child?: TraceGraph;
  layoutFlipThis?: boolean;
} | {
  extendedType: 'parent'
  parent?: TraceGraph;
}>

export interface TraceGraph {
  nodes: ExtendedNode[];
  edges: Edge[];
}

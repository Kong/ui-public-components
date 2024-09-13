export interface TracesResponse {
  data: Trace[];
  total: number;
  limit: number;
  offset: number;
  errors: null;
}

export interface Trace {
  traceID: string;
  spans: SpanLegacy[];
  processes: {
    [key: string]: {
      serviceName: string;
      tags: Tag[];
    };
  };
  warnings: null;
}

export interface SpanLegacy {
  traceID: string;
  spanID: string;
  operationName: string;
  references?: Reference[];
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

export interface SpanTreeNodeLegacy extends SpanLegacy {
  subtotalDuration: number;
  children?: SpanTreeNodeLegacy[];
}


export interface Span {
  traceId: string;
  spanId: string;
  name: string;
  parentSpanId: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
}

export interface SpanTreeNode extends Span {
  durationNano: number;
  parent?: SpanTreeNode;
  children: SpanTreeNode[];
}

export interface KeyValue {
  key: string;
  value: {
    stringValue?: string | null;
    boolValue?: boolean | null;
    intValue?: number | null;
  };
}

export interface Attribute {
  key: string;
  value: {
    stringValue?: string;
    intValue?: number;
  };
}

export interface SpanEvent {
  timeUnixNano: number;
  name: string;
  attributes: KeyValue[];
}

export enum SpanKind {
  INTERNAL = 'SPAN_KIND_INTERNAL',
  SERVER = 'SPAN_KIND_SERVER',
}

export interface SpanStatus {
  /**
   * The status of a span.
   *
   * Possible values:
   * * `0` = Unset
   * * `1` = OK
   * * `2` = Error
   */
  code: number;
  message: string;
}

export interface Span {
  kind: string;
  traceId: string;
  spanId: string;
  name: string;
  parentSpanId: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  attributes: KeyValue[];
  status: SpanStatus;
  events?: SpanEvent[];
}

export interface SpanTreeNode extends Span {
  root?: boolean;
  durationNano: number;
  parent?: SpanTreeNode;
  children: SpanTreeNode[];
}

export enum SpanType {
  ROOT = 'root',
  KONG = 'kong',
  UPSTREAM = 'upstream',
  THIRD_PARTY = 'third-party',
  CLIENT = 'client',
}

export interface SpanPresentation {
  label: string;
  color: string;
}

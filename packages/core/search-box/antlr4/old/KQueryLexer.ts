// Generated from KQueryLexer.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols
import type {
  ATN,
  CharStream,
  DecisionState,
} from 'antlr4'
import {
  ATNDeserializer, DFA,
  Lexer,
  LexerATNSimulator,
  RuleContext,
  PredictionContextCache,
  Token,
} from 'antlr4'
export default class KQueryLexer extends Lexer {
  public static readonly OR = 1
  public static readonly NOT = 2
  public static readonly AND = 3
  public static readonly TILDE = 4
  public static readonly OP_COLON = 5
  public static readonly GROUPING_LPAREN = 6
  public static readonly GROUPING_RPAREN = 7
  public static readonly RESERVED_AT = 8
  public static readonly NUMBER = 9
  public static readonly TERM = 10
  public static readonly QUOTED = 11
  public static readonly DEFAULT_SKIP = 12
  public static readonly UNKNOWN = 13
  public static readonly EOF = Token.EOF

  public static readonly channelNames: string[] = ['DEFAULT_TOKEN_CHANNEL', 'HIDDEN']
  public static readonly literalNames: (string | null)[] = [null, "'OR'",
    "'-'", "'AND'",
    "'~'", "':'",
    "'('", "')'",
    "'@'"]

  public static readonly symbolicNames: (string | null)[] = [null, 'OR',
    'NOT', 'AND',
    'TILDE', 'OP_COLON',
    'GROUPING_LPAREN',
    'GROUPING_RPAREN',
    'RESERVED_AT',
    'NUMBER', 'TERM',
    'QUOTED', 'DEFAULT_SKIP',
    'UNKNOWN']

  public static readonly modeNames: string[] = ['DEFAULT_MODE']

  public static readonly ruleNames: string[] = [
    'OR', 'NOT', 'AND', 'TILDE', 'OP_COLON', 'GROUPING_LPAREN', 'GROUPING_RPAREN',
    'RESERVED_AT', 'NUMBER', 'NUM_CHAR', 'TERM', 'ESCAPED_CHAR', 'TERM_CHAR',
    'TERM_START_CHAR', 'QUOTED', 'QUOTED_CHAR', 'DEFAULT_SKIP', 'WHITESPACE',
    'UNKNOWN',
  ]

  constructor(input: CharStream) {
    super(input)
    this._interp = new LexerATNSimulator(this, KQueryLexer._ATN, KQueryLexer.DecisionsToDFA, new PredictionContextCache())
  }

  public get grammarFileName(): string { return 'KQueryLexer.g4' }

  public get literalNames(): (string | null)[] { return KQueryLexer.literalNames }
  public get symbolicNames(): (string | null)[] { return KQueryLexer.symbolicNames }
  public get ruleNames(): string[] { return KQueryLexer.ruleNames }

  public get serializedATN(): number[] { return KQueryLexer._serializedATN }

  public get channelNames(): string[] { return KQueryLexer.channelNames }

  public get modeNames(): string[] { return KQueryLexer.modeNames }

  public static readonly _serializedATN: number[] = [4, 0, 13, 113, 6, -1, 2, 0,
    7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9,
    7, 9, 2, 10, 7, 10, 2, 11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7,
    16, 2, 17, 7, 17, 2, 18, 7, 18, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 3, 1, 3, 1, 4,
    1, 4, 1, 5, 1, 5, 1, 6, 1, 6, 1, 7, 1, 7, 1, 8, 4, 8, 60, 8, 8, 11, 8, 12, 8, 61, 1, 8, 1, 8, 4, 8, 66,
    8, 8, 11, 8, 12, 8, 67, 3, 8, 70, 8, 8, 1, 9, 1, 9, 1, 10, 1, 10, 5, 10, 76, 8, 10, 10, 10, 12, 10,
    79, 9, 10, 1, 11, 1, 11, 1, 11, 1, 12, 1, 12, 1, 12, 3, 12, 87, 8, 12, 1, 13, 1, 13, 3, 13, 91, 8,
    13, 1, 14, 1, 14, 5, 14, 95, 8, 14, 10, 14, 12, 14, 98, 9, 14, 1, 14, 1, 14, 1, 15, 1, 15, 3, 15,
    104, 8, 15, 1, 16, 1, 16, 1, 16, 1, 16, 1, 17, 1, 17, 1, 18, 1, 18, 0, 0, 19, 1, 1, 3, 2, 5, 3, 7, 4,
    9, 5, 11, 6, 13, 7, 15, 8, 17, 9, 19, 0, 21, 10, 23, 0, 25, 0, 27, 0, 29, 11, 31, 0, 33, 12, 35, 0,
    37, 13, 1, 0, 5, 1, 0, 48, 57, 2, 0, 43, 43, 45, 45, 14, 0, 9, 10, 13, 13, 32, 34, 40, 41, 43, 43,
    45, 45, 47, 47, 58, 58, 60, 62, 64, 64, 91, 94, 123, 123, 125, 126, 12288, 12288, 2, 0, 34,
    34, 92, 92, 4, 0, 9, 10, 13, 13, 32, 32, 12288, 12288, 115, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0,
    5, 1, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 9, 1, 0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 13, 1, 0, 0, 0, 0, 15, 1, 0, 0,
    0, 0, 17, 1, 0, 0, 0, 0, 21, 1, 0, 0, 0, 0, 29, 1, 0, 0, 0, 0, 33, 1, 0, 0, 0, 0, 37, 1, 0, 0, 0, 1, 39,
    1, 0, 0, 0, 3, 42, 1, 0, 0, 0, 5, 44, 1, 0, 0, 0, 7, 48, 1, 0, 0, 0, 9, 50, 1, 0, 0, 0, 11, 52, 1, 0, 0,
    0, 13, 54, 1, 0, 0, 0, 15, 56, 1, 0, 0, 0, 17, 59, 1, 0, 0, 0, 19, 71, 1, 0, 0, 0, 21, 73, 1, 0, 0, 0,
    23, 80, 1, 0, 0, 0, 25, 86, 1, 0, 0, 0, 27, 90, 1, 0, 0, 0, 29, 92, 1, 0, 0, 0, 31, 103, 1, 0, 0, 0,
    33, 105, 1, 0, 0, 0, 35, 109, 1, 0, 0, 0, 37, 111, 1, 0, 0, 0, 39, 40, 5, 79, 0, 0, 40, 41, 5, 82,
    0, 0, 41, 2, 1, 0, 0, 0, 42, 43, 5, 45, 0, 0, 43, 4, 1, 0, 0, 0, 44, 45, 5, 65, 0, 0, 45, 46, 5, 78,
    0, 0, 46, 47, 5, 68, 0, 0, 47, 6, 1, 0, 0, 0, 48, 49, 5, 126, 0, 0, 49, 8, 1, 0, 0, 0, 50, 51, 5, 58,
    0, 0, 51, 10, 1, 0, 0, 0, 52, 53, 5, 40, 0, 0, 53, 12, 1, 0, 0, 0, 54, 55, 5, 41, 0, 0, 55, 14, 1, 0,
    0, 0, 56, 57, 5, 64, 0, 0, 57, 16, 1, 0, 0, 0, 58, 60, 3, 19, 9, 0, 59, 58, 1, 0, 0, 0, 60, 61, 1, 0,
    0, 0, 61, 59, 1, 0, 0, 0, 61, 62, 1, 0, 0, 0, 62, 69, 1, 0, 0, 0, 63, 65, 5, 46, 0, 0, 64, 66, 3, 19,
    9, 0, 65, 64, 1, 0, 0, 0, 66, 67, 1, 0, 0, 0, 67, 65, 1, 0, 0, 0, 67, 68, 1, 0, 0, 0, 68, 70, 1, 0, 0,
    0, 69, 63, 1, 0, 0, 0, 69, 70, 1, 0, 0, 0, 70, 18, 1, 0, 0, 0, 71, 72, 7, 0, 0, 0, 72, 20, 1, 0, 0, 0,
    73, 77, 3, 27, 13, 0, 74, 76, 3, 25, 12, 0, 75, 74, 1, 0, 0, 0, 76, 79, 1, 0, 0, 0, 77, 75, 1, 0, 0,
    0, 77, 78, 1, 0, 0, 0, 78, 22, 1, 0, 0, 0, 79, 77, 1, 0, 0, 0, 80, 81, 5, 92, 0, 0, 81, 82, 9, 0, 0,
    0, 82, 24, 1, 0, 0, 0, 83, 87, 3, 27, 13, 0, 84, 87, 3, 23, 11, 0, 85, 87, 7, 1, 0, 0, 86, 83, 1, 0,
    0, 0, 86, 84, 1, 0, 0, 0, 86, 85, 1, 0, 0, 0, 87, 26, 1, 0, 0, 0, 88, 91, 8, 2, 0, 0, 89, 91, 3, 23,
    11, 0, 90, 88, 1, 0, 0, 0, 90, 89, 1, 0, 0, 0, 91, 28, 1, 0, 0, 0, 92, 96, 5, 34, 0, 0, 93, 95, 3, 31,
    15, 0, 94, 93, 1, 0, 0, 0, 95, 98, 1, 0, 0, 0, 96, 94, 1, 0, 0, 0, 96, 97, 1, 0, 0, 0, 97, 99, 1, 0,
    0, 0, 98, 96, 1, 0, 0, 0, 99, 100, 5, 34, 0, 0, 100, 30, 1, 0, 0, 0, 101, 104, 8, 3, 0, 0, 102, 104,
    3, 23, 11, 0, 103, 101, 1, 0, 0, 0, 103, 102, 1, 0, 0, 0, 104, 32, 1, 0, 0, 0, 105, 106, 3, 35, 17,
    0, 106, 107, 1, 0, 0, 0, 107, 108, 6, 16, 0, 0, 108, 34, 1, 0, 0, 0, 109, 110, 7, 4, 0, 0, 110, 36,
    1, 0, 0, 0, 111, 112, 9, 0, 0, 0, 112, 38, 1, 0, 0, 0, 9, 0, 61, 67, 69, 77, 86, 90, 96, 103, 1, 6,
    0, 0]

  private static __ATN: ATN
  public static get _ATN(): ATN {
    if (!KQueryLexer.__ATN) {
      KQueryLexer.__ATN = new ATNDeserializer().deserialize(KQueryLexer._serializedATN)
    }

    return KQueryLexer.__ATN
  }

  static DecisionsToDFA = KQueryLexer._ATN.decisionToState.map((ds: DecisionState, index: number) => new DFA(ds, index))
}

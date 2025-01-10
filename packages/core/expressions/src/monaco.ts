import * as monaco from 'monaco-editor'
import { type AstType } from '@kong/atc-router'
import { type Schema } from './schema'

interface MonarchLanguage extends monaco.languages.IMonarchLanguage {
  keywords: string[];
}

interface Item {
  property: string
  kind: AstType
  documentation?: string
}

const flattenProperties = (schema: Schema): Array<Item> => {
  const { definition, documentation } = schema
  const properties: Array<Item> = []
  Object.entries(definition).forEach(([kind, fields]) => {
    fields.forEach((field) => {
      properties.push({
        property: field,
        kind: kind as AstType,
        documentation: documentation?.[field],
      })
    })
  })
  return properties
}

export const theme = 'kong-expr-theme'

export const getLanguageId = (schemaName: string) => `kong-expr_${schemaName}`

export const registerTheme = () => {
  monaco.editor.defineTheme(theme, {
    inherit: true,
    base: 'vs',
    rules: [
      { token: 'operators', foreground: '#003694', fontStyle: 'bold' },
      { token: 'string', foreground: '#009966' },
      { token: 'string.escape', foreground: '#003694' },
      { token: 'string.escape.invalid', foreground: '#ff3333' },
      { token: 'number', foreground: '#009966' },
      { token: 'identifier', foreground: '#006699' },
    ],
    colors: {
      'editor.foreground': '#000000',
    },
  })
}

export const registerLanguage = (schema: Schema) => {
  const languageId = getLanguageId(schema.name)

  if (monaco.languages.getEncodedLanguageId(languageId) !== 0) {
    return { languageId }
  }

  const flatProperties = flattenProperties(schema)

  monaco.languages.register({ id: languageId })

  monaco.languages.setMonarchTokensProvider(languageId, {
    keywords: [], // keywords are not used but required
    tokenizer: {
      root: [
        [/==|!=|~|\^=|=\^|>=?|<=?|&&|\|\||(not )?in|contains/, 'operators'], // keep this before ident
        [/[a-zA-Z_]\w*(\.([a-zA-Z_]\w*)?)*/, 'identifier'],
        [/[ \t\r\n]+/, 'whitespace'],
        [/[()]/, '@brackets'],
        [/\d+/, 'number'],
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      ],
      string: [
        [/[^\\"]+/, 'string'], // escaped quote
        [/\\[ntr]/, 'string.escape'], // escape sequences
        [/\\./, 'string.escape.invalid'], // these are invalid escape sequences
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
    },
    brackets: [{ open: '(', close: ')', token: 'brackets' }],
  } as MonarchLanguage)

  monaco.languages.registerCompletionItemProvider(languageId, {
    // additional characters to trigger the following function
    triggerCharacters: ['.', '*', '"'],

    // function to generate object autocompletion
    provideCompletionItems: (model, position) => {
      const tokens = monaco.editor.tokenize(model.getValue(), languageId)
      const lineTokens = tokens[position.lineNumber - 1]

      if (lineTokens.length <= 0) {
        return { suggestions: [] }
      }

      let identToken: monaco.Token | undefined
      let identTokenEnd: number | undefined

      if (lineTokens.length === 1 && lineTokens[0].type === 'identifier.kong-expr-http') {
        identToken = lineTokens[0]
        identTokenEnd = model.getLineMaxColumn(position.lineNumber)
      } else {
        for (let i = 0; i < lineTokens.length - 1; i++) {
          if (lineTokens[i + 1].offset >= position.column - 1 && lineTokens[i].type === 'identifier.kong-expr-http') {
            identToken = lineTokens[i]
            identTokenEnd = lineTokens[i + 1].offset
            break
          }
        }
      }



      if (!identToken) {
        return { suggestions: [] }
      }

      return {
        suggestions: flatProperties.map((item) => ({
          label: item.property,
          kind: monaco.languages.CompletionItemKind.Property,
          detail: item.kind,
          documentation: item.documentation,
          insertText: item.property.replace(/\*/g, ''),
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: identToken.offset + 1,
            endColumn: identTokenEnd ?? model.getLineMaxColumn(position.lineNumber),
          },
        })),
      }
    },
  })

  monaco.languages.setLanguageConfiguration(languageId, {
    brackets: [['(', ')']],
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
    ],
  })

  return { languageId }
}

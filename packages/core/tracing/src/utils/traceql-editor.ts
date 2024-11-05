import type * as Monaco from 'monaco-editor'
import type { CompletionType } from 'src/traceql/autocomplete'

export const setupPlaceholder = (
  editor: Monaco.editor.IStandaloneCodeEditor,
  monaco: typeof Monaco,
) => {
  const placeholderDecorators = [
    {
      range: new monaco.Range(1, 1, 1, 1),
      options: {
        // className: styles.placeholder, // The placeholder text is in styles.placeholder
        isWholeLine: true,
      },
    },
  ]

  let decorators: string[] = []

  const checkDecorators = (): void => {
    const model = editor.getModel()

    if (!model) {
      return
    }

    const newDecorators =
      model.getValueLength() === 0 ? placeholderDecorators : []
    decorators = model.deltaDecorations(decorators, newDecorators)
  }

  checkDecorators()
  editor.onDidChangeModelContent(checkDecorators)
}

export const setupActions = (
  editor: Monaco.editor.IStandaloneCodeEditor,
  monaco: typeof Monaco,
  onRunQuery: () => void,
) => {
  editor.addAction({
    id: 'run-query',
    label: 'Run Query',
    keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.Enter],
    contextMenuGroupId: 'navigation',
    contextMenuOrder: 1.5,
    run: function() {
      onRunQuery()
    },
  })
}

export const setupRegisterInteractionCommand = (
  editor: Monaco.editor.IStandaloneCodeEditor,
): string | null => {
  return editor.addCommand(0, function(_, label, type: CompletionType) {
    const properties: Record<string, unknown> = {
      datasourceType: 'tempo',
      type,
    }
    // Filter out the label for TAG_VALUE completions to avoid potentially exposing sensitive data
    if (type !== 'TAG_VALUE') {
      properties.label = label
    }
  })
}

export const setupAutoSize = (editor: Monaco.editor.IStandaloneCodeEditor) => {
  const container = editor.getDomNode()
  const updateHeight = () => {
    if (container) {
      const contentHeight = Math.min(1000, editor.getContentHeight())
      const width = parseInt(container.style.width, 10)
      container.style.width = `${width}px`
      container.style.height = `${contentHeight}px`
      editor.layout({ width, height: contentHeight })
    }
  }
  editor.onDidContentSizeChange(updateHeight)
  updateHeight()
}

export const setupMonaco = async () => {
  const [EditorWorker] = await Promise.all([
    import('monaco-editor/esm/vs/editor/editor.worker?worker').then(module => module.default),
  ])

  window.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      return new EditorWorker()
    },
  }

  return await import('monaco-editor') as typeof Monaco
}

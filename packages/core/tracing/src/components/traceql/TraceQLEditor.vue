<template>
  <div class="traceql-editor">
    <div
      ref="editorRef"
      class="traceql-editor-editor"
    />
  </div>
</template>

<script lang="ts">
export const PropsDefinition = {
  readonly: {
    type: Boolean,
    default: false,
  },
}
</script>

<script setup lang="ts">
import type * as Monaco from 'monaco-editor'
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue'
import { getErrorNodes, setMarkers } from '../../traceql/highlighting'
import { languageDefinition } from '../../traceql/traceql'
import { setupAutoSize, setupMonaco, setupPlaceholder } from '../../utils/traceql-editor'
import { CompletionProvider } from '../../traceql/autocomplete'

const props = defineProps(PropsDefinition)

const monaco = await setupMonaco()

let traceqlSetupDone = false
const langId = 'traceql'
let errorTimeoutId: number

const ensureTraceQL = (monaco: typeof Monaco) => {
  if (!traceqlSetupDone) {
    traceqlSetupDone = true
    const { aliases, extensions, mimetypes, def } = languageDefinition
    monaco.languages.register({ id: langId, aliases, extensions, mimetypes })
    monaco.languages.setMonarchTokensProvider(langId, def.language)
    monaco.languages.setLanguageConfiguration(langId, def.languageConfiguration)
  }
}

const setAutocomplete = () => {
  /**
 * Hook that returns function that will set up monaco autocomplete for the label selector
 * @param datasource the Tempo datasource instance
 * @param setAlertText setter for alert's text
 */
  function useAutocomplete(datasource: TempoDatasource, setAlertText: (text?: string) => void) {
  // We need the provider ref so we can pass it the label/values data later. This is because we run the call for the
  // values here but there is additional setup needed for the provider later on. We could run the getSeries() in the
  // returned function but that is run after the monaco is mounted so would delay the request a bit when it does not
  // need to.
    const providerRef = useRef<CompletionProvider>(
      new CompletionProvider({ languageProvider: datasource.languageProvider, setAlertText }),
    )

    useEffect(() => {
      const fetchTags = async () => {
        try {
          await datasource.languageProvider.start()
          setAlertText(undefined)
        } catch (error) {
          if (error instanceof Error) {
            setAlertText(`Error: ${error.message}`)
          }
        }
      }
      fetchTags()
    }, [datasource, setAlertText])

    const autocompleteDisposeFun = useRef<(() => void) | null>(null)
    useEffect(() => {
    // when we unmount, we unregister the autocomplete-function, if it was registered
      return () => {
        autocompleteDisposeFun.current?.()
      }
    }, [])

    // This should be run in monaco onEditorDidMount
    return (
      editor: Monaco.editor.IStandaloneCodeEditor,
      monaco: typeof Monaco,
      registerInteractionCommandId: string | null,
    ) => {
      providerRef.current.editor = editor
      providerRef.current.monaco = monaco
      providerRef.current.setRegisterInteractionCommandId(registerInteractionCommandId)

      const { dispose } = monaco.languages.registerCompletionItemProvider(langId, providerRef.current)
      autocompleteDisposeFun.current = dispose
    }
  }
}

let editor: Monaco.editor.IStandaloneCodeEditor
let editorDisposables: Monaco.IDisposable[] = []

const editorRef = ref<HTMLElement | null>(null)

onBeforeMount(() => {
  ensureTraceQL(monaco)
})

onMounted(async () => {
  editor = monaco.editor.create(editorRef.value as HTMLElement, {
    theme: 'vs',
    language: langId,
    value: '',
    folding: false,
    fontSize: 14,
    lineNumbers: 'off',
    overviewRulerLanes: 0,
    renderLineHighlight: 'none',
    scrollbar: {
      vertical: 'hidden',
      verticalScrollbarSize: 8, // used as "padding-right"
      horizontal: 'hidden',
      horizontalScrollbarSize: 0,
    },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
  })

  editorDisposables.push(
    editor.onDidChangeModelContent((e) => {

    }),
  )

  if (!props.readonly) {
    // setupAutocompleteFn(editor, monaco, setupRegisterInteractionCommand(editor))
    // setupActions(editor, monaco, () => onRunQueryRef.current())
    setupPlaceholder(editor, monaco)
  }
  setupAutoSize(editor)

  // Parse query that might already exist (e.g., after a page refresh)
  const model = editor.getModel()
  if (model) {
    const errorNodes = getErrorNodes(model.getValue())
    setMarkers(monaco, model, errorNodes)
  }

  // Register callback for query changes
  editor.onDidChangeModelContent((changeEvent) => {
    const model = editor.getModel()

    if (!model) {
      return
    }

    // Remove previous callback if existing, to prevent squiggles from been shown while the user is still typing
    window.clearTimeout(errorTimeoutId)

    const errorNodes = getErrorNodes(model.getValue())
    const cursorPosition = changeEvent.changes[0].rangeOffset

    // Immediately updates the squiggles, in case the user fixed an error,
    // excluding the error around the cursor position
    setMarkers(
      monaco,
      model,
      errorNodes.filter((errorNode) => !(errorNode.from <= cursorPosition && cursorPosition <= errorNode.to)),
    )

    // Later on, show all errors
    errorTimeoutId = window.setTimeout(() => {
      setMarkers(monaco, model, errorNodes)
    }, 500)
  })

  editor.focus()
  editorDisposables.push(editor)
})

onBeforeUnmount(() => {
  editorDisposables.forEach((d) => d?.dispose())
})
</script>

<style lang="scss" scoped>
.traceql-editor {
  display: flex;
  flex-direction: column;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;

  .traceql-editor-editor {
    height: 500px;
    width: 100%;

    :deep(.line-error-decorator) {
      background-color: rgb(255, 220, 220);
      width: 5px !important;
      margin-left: 3px;
    }

    :deep(.line-error) {
      background-color: rgb(255, 0, 0, 0.05);
    }
  }
}
</style>

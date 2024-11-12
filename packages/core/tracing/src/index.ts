// import type { App } from 'vue'
import TraceQLEditor from './components/traceql/TraceQLEditor.vue'
import TraceQLEditorLoader from './components/traceql/TraceQLEditorLoader.vue'
import TraceViewer from './components/TraceViewer.vue'
import TraceViewerSlideout from './components/TraceViewerSlideout.vue'
import WaterfallView from './components/waterfall/WaterfallView.vue'

export * from './types'
export * from './utils'

// Export Vue plugin
// We rarely want to export components as a plugin as we prefer to support proper tree-shaking in the host application. Only enable if you're packing a Vue plugin.
// export default {
//   // Customize Vue plugin options as desired
//   // Providing a `name` property allows for customizing the registered
//   // name of your component (useful if exporting a single component).
//   install: (app: App, options: { name?: string, [key: string]: any } = {}): void => {
//     app.component(options.name || 'Tracing', Tracing)
//   },
// }

export { TraceQLEditor, TraceQLEditorLoader, TraceViewer, TraceViewerSlideout, WaterfallView }


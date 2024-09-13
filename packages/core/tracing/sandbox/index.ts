import Kongponents from '@kong/kongponents'
import '@kong/kongponents/dist/style.css'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(Kongponents)

app.mount('#app')


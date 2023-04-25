/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import FloatingVue from 'floating-vue'

const app = createApp(App)

registerPlugins(app)

FloatingVue.options.distance = 6
FloatingVue.options.arrowOverflow = true
FloatingVue.options.themes.tooltip.delay.show = 0
FloatingVue.options.themes.tooltip.html = true

app.use(FloatingVue)
app.mount('#app')

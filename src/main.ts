import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { STORAGE_KEYS } from '@/lib/constants'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
if (localStorage.getItem(STORAGE_KEYS.TOKEN)) {
  authStore.fetchMe().catch(() => authStore.logout())
}

app.mount('#app')

import './assets/main.css'
import '@/lib/chartSetup'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import i18n from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { STORAGE_KEYS } from '@/lib/constants'

async function bootstrap() {
  try {
    const app = createApp(App)
    const pinia = createPinia()

    app.use(pinia)
    app.use(router)
    app.use(i18n)

    console.log('APP START')

    app.mount('#app')

    console.log('APP MOUNTED')

    const authStore = useAuthStore()

    if (localStorage.getItem(STORAGE_KEYS.TOKEN)) {
      await authStore.fetchMe().catch(() => authStore.logout())
    }
  } catch (e) {
    console.error('BOOTSTRAP ERROR', e)
  }
}

bootstrap()

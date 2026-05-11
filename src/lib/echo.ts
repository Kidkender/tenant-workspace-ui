import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { STORAGE_KEYS } from '@/lib/constants'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echoInstance: Echo<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEcho(): Echo<any> {
  if (echoInstance) return echoInstance

  window.Pusher = Pusher

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_WS_HOST,
    wsPort: import.meta.env.VITE_REVERB_WS_PORT ?? 8080,
    wsPath: import.meta.env.PROD ? '/ws' : '',
    forceTLS: false,
    enableTransports: ['ws'],
    authEndpoint: import.meta.env.VITE_REVERB_AUTH_ENDPOINT,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}`,
        'X-Tenant-ID': localStorage.getItem(STORAGE_KEYS.TENANT_ID) ?? '',
      },
    },
  })

  return echoInstance
}

export function destroyEcho(): void {
  echoInstance?.disconnect()
  echoInstance = null
}

import axios from 'axios'
import { STORAGE_KEYS } from './constants'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  const tenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      localStorage.removeItem(STORAGE_KEYS.TENANT_ID)
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 403) {
      // Import lazily để tránh circular dependency với pinia
      import('@/stores/toast').then(({ useToastStore }) => {
        useToastStore().error('Bạn không có quyền thực hiện hành động này.')
      })
    }

    return Promise.reject(error)
  },
)

export default http

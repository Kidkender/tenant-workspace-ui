import axios from 'axios'
import { useI18n } from 'vue-i18n'

export function useApiError() {
  const { t, te } = useI18n()

  function getErrorMessage(e: unknown, fallbackKey: string): string {
    if (axios.isAxiosError(e)) {
      const code: string | undefined = e.response?.data?.error
      if (code && te(`errors.${code}`)) {
        return t(`errors.${code}`)
      }
    }
    return t(fallbackKey)
  }

  function getErrorCode(e: unknown): string | undefined {
    if (axios.isAxiosError(e)) {
      return e.response?.data?.error
    }
    return undefined
  }

  return { getErrorMessage, getErrorCode }
}

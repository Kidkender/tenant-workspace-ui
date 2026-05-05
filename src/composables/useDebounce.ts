import { ref, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useDebounce<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref<T>(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout>

  const stop = watch(source, (val) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  onUnmounted(() => {
    stop()
    clearTimeout(timer)
  })

  return debounced
}

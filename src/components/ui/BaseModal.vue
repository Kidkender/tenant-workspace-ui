<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    size?: 'sm' | 'md' | 'lg'
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
    titleId?: string
  }>(),
  {
    size: 'md',
    closeOnBackdrop: true,
    closeOnEscape: true,
    titleId: 'modal-title',
  },
)

const emit = defineEmits<{ close: [] }>()

const panelRef = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable() {
  return Array.from(panelRef.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
}

function trapFocus(e: KeyboardEvent) {
  const focusable = getFocusable()
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === first && last) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last && first) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  if (e.key === 'Escape' && props.closeOnEscape) {
    emit('close')
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      previouslyFocused = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', trapFocus)
      await nextTick()
      getFocusable()[0]?.focus()
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', trapFocus)
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', trapFocus)
})

function onBackdropClick() {
  if (props.closeOnBackdrop) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true"
        :aria-labelledby="titleId">
        <div class="absolute inset-0 bg-black/40" @click="onBackdropClick" />

        <div ref="panelRef" class="relative bg-white rounded-xl shadow-xl w-full p-6" :class="sizeClass[size]">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

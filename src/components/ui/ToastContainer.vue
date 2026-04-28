<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const icons = {
  success: '✓',
  error: '✕',
  info: 'i',
}

const styles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-gray-800 text-white',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      <TransitionGroup
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg text-sm max-w-sm cursor-pointer"
          :class="styles[toast.type]"
          @click="toastStore.remove(toast.id)"
        >
          <span class="w-4 h-4 rounded-full border-2 border-white/60 flex items-center justify-center text-[10px] font-bold shrink-0">
            {{ icons[toast.type] }}
          </span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

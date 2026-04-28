<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div ref="menuRef" class="relative">
    <button
      @click="open = !open"
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition text-sm"
    >
      <span
        class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center uppercase"
      >
        {{ authStore.user?.name?.charAt(0) ?? '?' }}
      </span>
      <span class="text-gray-700 font-medium max-w-32 truncate">{{ authStore.user?.name }}</span>
      <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
    >
      <div class="px-3 py-2 border-b border-gray-100">
        <p class="text-xs font-medium text-gray-700 truncate">{{ authStore.user?.name }}</p>
        <p class="text-xs text-gray-400 truncate">{{ authStore.user?.email }}</p>
      </div>
      <RouterLink
        :to="{ name: 'profile' }"
        @click="open = false"
        class="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
      >
        {{ t('profile.viewProfile') }}
      </RouterLink>
      <div class="border-t border-gray-100 mt-1 pt-1">
        <button
          @click="logout"
          class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          {{ t('user.logout') }}
        </button>
      </div>
    </div>
  </div>
</template>

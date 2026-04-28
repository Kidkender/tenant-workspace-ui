<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemberStore } from '@/stores/member'

const store = useMemberStore()
const { t } = useI18n()

onMounted(() => store.fetchMembers())

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-gray-900">{{ t('members.title') }}</h1>
      <span class="text-sm text-gray-500">{{ t('members.count', { n: store.members.length }) }}</span>
    </div>

    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-20 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="store.members.length === 0" class="text-center py-16 text-gray-400 text-sm">
      {{ t('members.empty') }}
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="member in store.members"
        :key="member.id"
        class="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
      >
        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0">
          {{ initials(member.name) }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ member.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ member.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

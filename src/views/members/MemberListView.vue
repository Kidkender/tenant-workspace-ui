<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemberStore } from '@/stores/member'
import type { TenantMember } from '@/types'
import InviteMemberModal from '@/components/tenant/InviteMemberModal.vue'
import MemberDetailModal from '@/components/tenant/MemberDetailModal.vue'

const store = useMemberStore()
const { t } = useI18n()
const showInviteModal = ref(false)
const selectedMember = ref<TenantMember | null>(null)

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
      <div>
        <h1 class="text-xl font-semibold text-gray-900">{{ t('members.title') }}</h1>
        <span class="text-sm text-gray-500">{{ t('members.count', { n: store.members.length }) }}</span>
      </div>
      <button
        @click="showInviteModal = true"
        class="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('members.invite') }}
      </button>
    </div>

    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-20 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <div v-else-if="store.members.length === 0" class="text-center py-16 text-gray-400 text-sm">
      {{ t('members.empty') }}
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        v-for="member in store.members"
        :key="member.id"
        @click="selectedMember = member"
        class="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 text-left hover:border-blue-300 hover:shadow-sm transition cursor-pointer w-full"
      >
        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0">
          {{ initials(member.name) }}
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ member.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ member.email }}</p>
        </div>
      </button>
    </div>
  </div>

  <InviteMemberModal v-if="showInviteModal" @close="showInviteModal = false" />
  <MemberDetailModal
    v-if="selectedMember"
    :member="selectedMember"
    @close="selectedMember = null"
  />
</template>

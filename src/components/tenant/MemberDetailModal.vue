<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemberStore } from '@/stores/member'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { TenantMember } from '@/types'

const props = defineProps<{ member: TenantMember }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const memberStore = useMemberStore()
const tenantStore = useTenantStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const removing = ref(false)
const updatingRole = ref(false)
const selectedRoleId = ref<number | null>(null)

const currentUserRole = computed(() => tenantStore.currentTenant?.role)
const isOwner = computed(() => currentUserRole.value === 'owner')
const isMemberOwner = computed(() => props.member.role === 'owner')
const isSelf = computed(() => props.member.id === authStore.user?.id)
const canManage = computed(() => isOwner.value && !isMemberOwner.value && !isSelf.value)

const manageableRoles = computed(() =>
  memberStore.roles.filter((r) => r.name === 'admin' || r.name === 'member'),
)

onMounted(async () => {
  if (isOwner.value) {
    await memberStore.fetchRoles()
    const currentRole = memberStore.roles.find((r) => r.name === props.member.role)
    selectedRoleId.value = currentRole?.id ?? null
  }
})

async function handleRemove() {
  if (!confirm(t('members.removeConfirm', { name: props.member.name }))) return
  removing.value = true
  try {
    await memberStore.removeMember(props.member.id)
    toastStore.success(t('members.removed'))
    emit('close')
  } catch {
    toastStore.error(t('members.removeError'))
  } finally {
    removing.value = false
  }
}

async function handleRoleChange() {
  if (!selectedRoleId.value) return
  updatingRole.value = true
  try {
    await memberStore.updateMemberRole(props.member.id, selectedRoleId.value)
    toastStore.success(t('members.roleUpdated'))
  } catch {
    toastStore.error(t('members.roleError'))
  } finally {
    updatingRole.value = false
  }
}

function roleBadgeClass(role: string | null) {
  if (role === 'owner') return 'bg-amber-100 text-amber-700'
  if (role === 'admin') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-600'
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <Teleport to="body">
  <div
    class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
      <div class="flex items-start justify-between mb-5">
        <h2 class="text-lg font-semibold text-gray-900">{{ t('members.detailTitle') }}</h2>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 transition"
          :aria-label="t('members.detailClose')"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex flex-col items-center gap-3 py-2">
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700">
          {{ initials(props.member.name) }}
        </div>
        <div class="text-center">
          <p class="text-base font-semibold text-gray-900">{{ props.member.name }}</p>
          <p class="text-sm text-gray-500 mt-0.5">{{ props.member.email }}</p>
          <span
            v-if="props.member.role"
            class="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium capitalize"
            :class="roleBadgeClass(props.member.role)"
          >
            {{ t(`members.roles.${props.member.role}`, props.member.role) }}
          </span>
        </div>
      </div>

      <div class="mt-5 space-y-2 text-sm border-t border-gray-100 pt-4">
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('members.detailName') }}</span>
          <span class="text-gray-900 font-medium">{{ props.member.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('members.detailEmail') }}</span>
          <span class="text-gray-900 font-medium">{{ props.member.email }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('members.detailRole') }}</span>
          <span class="text-gray-900 font-medium capitalize">
            {{ t(`members.roles.${props.member.role}`, props.member.role ?? '—') }}
          </span>
        </div>
      </div>

      <div v-if="canManage" class="mt-5 space-y-3 border-t border-gray-100 pt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.changeRole') }}</label>
          <div class="flex gap-2">
            <select
              v-model="selectedRoleId"
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option v-for="r in manageableRoles" :key="r.id" :value="r.id">
                {{ t(`members.roles.${r.name}`, r.name) }}
              </option>
            </select>
            <button
              :disabled="updatingRole"
              @click="handleRoleChange"
              class="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
            >
              {{ updatingRole ? '...' : t('members.saveRole') }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-5 flex justify-between items-center">
        <button
          v-if="canManage"
          :disabled="removing"
          @click="handleRemove"
          class="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
        >
          {{ removing ? t('members.removing') : t('members.remove') }}
        </button>
        <button
          v-else
          class="invisible"
        />
        <button
          @click="emit('close')"
          class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          {{ t('members.detailClose') }}
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>

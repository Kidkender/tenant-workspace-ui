<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemberStore } from '@/stores/member'
import { useToastStore } from '@/stores/toast'

const emit = defineEmits<{ close: [] }>()

const store = useMemberStore()
const toastStore = useToastStore()
const { t } = useI18n()

const form = ref({ email: '', role_id: '' })
const error = ref('')

onMounted(() => {
  store.fetchRoles().catch((e) => console.error('fetchRoles error:', e))
})

async function handleSubmit() {
  if (store.inviting || !form.value.email.trim() || !form.value.role_id) return
  error.value = ''

  try {
    await store.invite(form.value.email.trim(), Number(form.value.role_id))
    toastStore.success(t('members.inviteSuccess'))
    emit('close')
  } catch {
    error.value = t('members.inviteError')
  }
}
</script>

<template>
  <Teleport to="body">
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('members.inviteTitle') }}</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('members.inviteEmail') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            :placeholder="t('members.inviteEmailPlaceholder')"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('members.inviteRole') }} <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.role_id"
            required
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white text-gray-700"
          >
            <option value="" disabled>{{ t('members.inviteRolePlaceholder') }}</option>
            <option v-for="role in store.roles" :key="role.id" :value="role.id">
              {{ t(`members.roles.${role.name}`, role.name) }}
            </option>
          </select>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex gap-2 justify-end pt-1">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            {{ t('members.inviteCancel') }}
          </button>
          <button
            type="submit"
            :disabled="store.inviting"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
          >
            {{ store.inviting ? t('members.inviteSending') : t('members.inviteSubmit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
  </Teleport>
</template>

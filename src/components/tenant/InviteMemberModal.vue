<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemberStore } from '@/stores/member'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'
import BaseModal from '@/components/ui/BaseModal.vue'
import TextInput from '@/components/ui/TextInput.vue'
import SelectField from '@/components/ui/SelectField.vue'

const emit = defineEmits<{ close: [] }>()

const store = useMemberStore()
const toastStore = useToastStore()
const { t } = useI18n()
const { getErrorMessage } = useApiError()

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
  } catch (e: unknown) {
    error.value = getErrorMessage(e, 'members.inviteError')
  }
}
</script>

<template>
  <BaseModal :open="true" size="sm" title-id="invite-member-title" @close="emit('close')">
    <h2 id="invite-member-title" class="text-lg font-semibold text-gray-900 mb-4">
      {{ t('members.inviteTitle') }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <TextInput
        v-model="form.email"
        type="email"
        :label="t('members.inviteEmail')"
        :placeholder="t('members.inviteEmailPlaceholder')"
        required
      />

      <SelectField v-model="form.role_id" :label="t('members.inviteRole')" required>
        <option value="" disabled>{{ t('members.inviteRolePlaceholder') }}</option>
        <option v-for="role in store.roles" :key="role.id" :value="role.id">
          {{ t(`members.roles.${role.name}`, role.name) }}
        </option>
      </SelectField>

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
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/task'
import { useToastStore } from '@/stores/toast'
import { useMemberStore } from '@/stores/member'
import BaseModal from '@/components/ui/BaseModal.vue'
import TextInput from '@/components/ui/TextInput.vue'
import TextArea from '@/components/ui/TextArea.vue'
import SelectField from '@/components/ui/SelectField.vue'
import DateField from '@/components/ui/DateField.vue'

const emit = defineEmits<{ close: [] }>()

const taskStore = useTaskStore()
const toastStore = useToastStore()
const memberStore = useMemberStore()
const { t } = useI18n()
const loading = ref(false)
const error = ref('')

const form = ref({
  title: '',
  description: '',
  assigned_to: '',
  due_date: '',
})

onMounted(() => {
  memberStore.fetchMembers()
})

async function handleSubmit() {
  if (loading.value || !form.value.title.trim()) return
  error.value = ''
  loading.value = true

  try {
    await taskStore.createTask({
      title: form.value.title.trim(),
      description: form.value.description || undefined,
      assigned_to: form.value.assigned_to || undefined,
      due_date: form.value.due_date || undefined,
    })
    toastStore.success(t('createTask.success'))
    emit('close')
  } catch {
    error.value = t('createTask.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="true" title-id="create-task-title" @close="emit('close')">
    <h2 id="create-task-title" class="text-lg font-semibold text-gray-900 mb-4">
      {{ t('createTask.title') }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <TextInput
        v-model="form.title"
        :label="t('createTask.titleField')"
        :placeholder="t('createTask.titlePlaceholder')"
        required
      />

      <TextArea
        v-model="form.description"
        :label="t('createTask.description')"
        :placeholder="t('createTask.descriptionPlaceholder')"
      />

      <SelectField v-model="form.assigned_to" :label="t('createTask.assignTo')">
        <option value="">{{ t('createTask.noAssign') }}</option>
        <option v-for="m in memberStore.members" :key="m.id" :value="m.id">
          {{ m.name }} ({{ m.email }})
        </option>
      </SelectField>

      <DateField v-model="form.due_date" :label="t('createTask.deadline')" />

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-2 justify-end pt-1">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          {{ t('createTask.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
        >
          {{ loading ? t('createTask.submitting') : t('createTask.submit') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

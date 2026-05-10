<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/task'
import { useToastStore } from '@/stores/toast'
import { useMemberStore } from '@/stores/member'
import { useAttachmentStore } from '@/stores/attachment'
import BaseModal from '@/components/ui/BaseModal.vue'
import TextInput from '@/components/ui/TextInput.vue'
import TextArea from '@/components/ui/TextArea.vue'
import SelectField from '@/components/ui/SelectField.vue'
import DateField from '@/components/ui/DateField.vue'

const emit = defineEmits<{ close: [] }>()

const taskStore = useTaskStore()
const toastStore = useToastStore()
const memberStore = useMemberStore()
const attachmentStore = useAttachmentStore()
const { t } = useI18n()
const loading = ref(false)
const error = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingFiles = ref<File[]>([])

const MAX_SIZE = 20 * 1024 * 1024

const form = ref({
  title: '',
  description: '',
  assigned_to: '',
  due_date: '',
})

onMounted(() => {
  memberStore.fetchMembers()
})

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onFileInput(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    if (file.size > MAX_SIZE) continue
    if (!pendingFiles.value.find((f) => f.name === file.name && f.size === file.size)) {
      pendingFiles.value.push(file)
    }
  }
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function removeFile(index: number) {
  pendingFiles.value.splice(index, 1)
}

async function handleSubmit() {
  if (loading.value || !form.value.title.trim()) return
  error.value = ''
  loading.value = true

  try {
    const task = await taskStore.createTask({
      title: form.value.title.trim(),
      description: form.value.description || undefined,
      assigned_to: form.value.assigned_to || undefined,
      due_date: form.value.due_date || undefined,
    })

    if (pendingFiles.value.length > 0) {
      await Promise.allSettled(
        pendingFiles.value.map((file) => attachmentStore.upload(task.id, file)),
      )
    }

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

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">
          {{ t('attachment.title') }}
        </label>

        <input ref="fileInputRef" type="file" multiple class="hidden" @change="onFileInput" />

        <button
          type="button"
          @click="fileInputRef?.click()"
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 hover:border-gray-400 rounded-lg px-3 py-2 transition w-full justify-center"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {{ t('attachment.attach') }}
        </button>

        <ul v-if="pendingFiles.length > 0" class="mt-2 space-y-1">
          <li
            v-for="(file, i) in pendingFiles"
            :key="i"
            class="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-1.5"
          >
            <span class="flex-1 truncate">{{ file.name }}</span>
            <span class="text-xs text-gray-400 shrink-0">{{ formatSize(file.size) }}</span>
            <button
              type="button"
              @click="removeFile(i)"
              class="text-gray-400 hover:text-red-500 transition shrink-0"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        </ul>
      </div>

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

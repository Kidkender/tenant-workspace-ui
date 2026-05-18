<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLabelStore } from '@/stores/label'
import { usePermission } from '@/composables/usePermission'
import { PERMISSIONS } from '@/lib/constants'
import type { Label } from '@/types'

const props = defineProps<{
  taskId: string
  taskLabels: Label[]
}>()

const emit = defineEmits<{
  updated: [labels: Label[]]
}>()

const { t } = useI18n()
const labelStore = useLabelStore()
const { can } = usePermission()

const showDropdown = ref(false)
const syncing = ref(false)

const selectedIds = ref<Set<string>>(new Set(props.taskLabels.map((l) => l.id)))

onMounted(() => {
  if (labelStore.labels.length === 0) {
    labelStore.fetchLabels()
  }
})

const hasChanges = computed(() => {
  const current = new Set(props.taskLabels.map((l) => l.id))
  if (current.size !== selectedIds.value.size) return true
  for (const id of current) {
    if (!selectedIds.value.has(id)) return true
  }
  return false
})

function toggleLabel(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  selectedIds.value = next
}

async function applyLabels() {
  syncing.value = true
  try {
    const labels = await labelStore.syncTaskLabels(props.taskId, [...selectedIds.value])
    emit('updated', labels)
    showDropdown.value = false
  } finally {
    syncing.value = false
  }
}

function closeDropdown() {
  showDropdown.value = false
  selectedIds.value = new Set(props.taskLabels.map((l) => l.id))
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {{ t('labels.taskLabels') }}
      </span>
      <button
        v-if="can(PERMISSIONS.TASK_UPDATE)"
        @click="showDropdown = !showDropdown"
        class="text-xs text-blue-600 hover:text-blue-800 transition"
      >
        {{ t('labels.add') }}
      </button>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="label in taskLabels"
        :key="label.id"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
        :style="{ backgroundColor: label.color ?? '#6366f1' }"
      >
        {{ label.name }}
      </span>
      <span v-if="taskLabels.length === 0" class="text-xs text-gray-400 italic">
        {{ t('labels.noLabels') }}
      </span>
    </div>

    <!-- Dropdown to pick labels -->
    <div
      v-if="showDropdown"
      class="absolute z-20 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 space-y-2"
    >
      <p class="text-xs font-semibold text-gray-700">{{ t('labels.apply') }}</p>

      <div v-if="labelStore.loading" class="text-xs text-gray-400 py-2 text-center">
        ...
      </div>

      <div v-else-if="labelStore.labels.length === 0" class="text-xs text-gray-400 py-2 text-center">
        {{ t('labels.empty') }}
      </div>

      <ul v-else class="space-y-1 max-h-48 overflow-y-auto">
        <li
          v-for="label in labelStore.labels"
          :key="label.id"
          @click="toggleLabel(label.id)"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition"
        >
          <span
            class="w-3 h-3 rounded-full shrink-0"
            :style="{ backgroundColor: label.color ?? '#6366f1' }"
          />
          <span class="text-sm text-gray-700 flex-1">{{ label.name }}</span>
          <span v-if="selectedIds.has(label.id)" class="text-blue-600 text-xs">✓</span>
        </li>
      </ul>

      <div class="flex gap-2 pt-1 border-t border-gray-100">
        <button
          @click="applyLabels"
          :disabled="syncing || !hasChanges"
          class="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {{ syncing ? '...' : t('labels.save') }}
        </button>
        <button
          @click="closeDropdown"
          class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition"
        >
          {{ t('labels.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoleStore } from '@/stores/role'
import { useBillingStore } from '@/stores/billing'
import type { CustomRole, Permission } from '@/types'
import { useToastStore } from '@/stores/toast'
import { useApiError } from '@/composables/useApiError'

const { t } = useI18n()
const roleStore = useRoleStore()
const billingStore = useBillingStore()
const toastStore = useToastStore()
const { getErrorMessage } = useApiError()

const showModal = ref(false)
const editingRole = ref<CustomRole | null>(null)
const deletingId = ref<number | null>(null)

const form = ref({ name: '', description: '', permissions: [] as number[] })
const formError = ref('')

const canCreateCustomRoles = computed(() => {
  const features = billingStore.subscription?.plan?.features ?? []
  const f = features.find((x) => x.feature_key === 'custom_roles')
  return f?.value === 'true'
})

const systemRoles = computed(() => roleStore.roles.filter((r) => r.tenant_id === null))
const customRoles = computed(() => roleStore.roles.filter((r) => r.tenant_id !== null))

const permissionGroups = computed(() => {
  const groups: Record<string, Permission[]> = {}
  for (const p of roleStore.permissions) {
    const [prefix] = p.key.split('.')
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(p)
  }
  return groups
})

onMounted(async () => {
  await Promise.all([
    roleStore.fetchRoles(),
    roleStore.fetchPermissions(),
    billingStore.fetchSubscription(),
  ])
})

function openCreate() {
  editingRole.value = null
  form.value = { name: '', description: '', permissions: [] }
  formError.value = ''
  showModal.value = true
}

function openEdit(role: CustomRole) {
  editingRole.value = role
  form.value = {
    name: role.name,
    description: role.description ?? '',
    permissions: role.permissions.map((p) => p.id),
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingRole.value = null
}

function togglePermission(id: number) {
  const idx = form.value.permissions.indexOf(id)
  if (idx === -1) {
    form.value.permissions = [...form.value.permissions, id]
  } else {
    form.value.permissions = form.value.permissions.filter((x) => x !== id)
  }
}

async function submitForm() {
  formError.value = ''
  try {
    if (editingRole.value) {
      await roleStore.updateRole(editingRole.value.id, {
        name: form.value.name,
        description: form.value.description || undefined,
        permissions: form.value.permissions,
      })
      toastStore.success(t('roles.updated'))
    } else {
      await roleStore.createRole({
        name: form.value.name,
        description: form.value.description || undefined,
        permissions: form.value.permissions,
      })
      toastStore.success(t('roles.created'))
    }
    closeModal()
  } catch (err: unknown) {
    formError.value = getErrorMessage(err, 'roles.saveError')
  }
}

async function confirmDelete(id: number) {
  if (!confirm(t('roles.deleteConfirm'))) return
  deletingId.value = id
  try {
    await roleStore.deleteRole(id)
    toastStore.success(t('roles.deleted'))
  } catch (err: unknown) {
    toastStore.error(getErrorMessage(err, 'roles.deleteError'))
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">{{ t('roles.title') }}</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ t('roles.subtitle') }}</p>
      </div>
      <button
        v-if="canCreateCustomRoles"
        @click="openCreate"
        class="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('roles.create') }}
      </button>
    </div>

    <!-- Upgrade banner -->
    <div
      v-if="!canCreateCustomRoles && billingStore.subscription"
      class="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm"
    >
      <svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <span class="text-amber-800">{{ t('roles.upgradeNotice') }}</span>
    </div>

    <!-- Loading -->
    <div v-if="roleStore.loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-16 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <template v-else>
      <!-- System roles -->
      <section>
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {{ t('roles.systemRoles') }}
        </h2>
        <div class="space-y-2">
          <div
            v-for="role in systemRoles"
            :key="role.id"
            class="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 capitalize">{{ role.name }}</p>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="perm in role.permissions"
                  :key="perm.id"
                  class="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5"
                >
                  {{ perm.key }}
                </span>
              </div>
            </div>
            <span class="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
              {{ t('roles.system') }}
            </span>
          </div>
        </div>
      </section>

      <!-- Custom roles -->
      <section>
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {{ t('roles.customRoles') }}
        </h2>

        <div v-if="customRoles.length === 0" class="text-center py-10 text-gray-400 text-sm">
          {{ t('roles.empty') }}
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="role in customRoles"
            :key="role.id"
            class="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 capitalize">{{ role.name }}</p>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="perm in role.permissions"
                  :key="perm.id"
                  class="text-xs bg-blue-50 text-blue-600 rounded px-1.5 py-0.5"
                >
                  {{ perm.key }}
                </span>
                <span v-if="role.permissions.length === 0" class="text-xs text-gray-400">
                  {{ t('roles.noPermissions') }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                @click="openEdit(role)"
                class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                :title="t('roles.edit')"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="confirmDelete(role.id)"
                :disabled="deletingId === role.id"
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                :title="t('roles.delete')"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>

  <!-- Create / Edit modal -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <!-- Modal header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 class="text-base font-semibold text-gray-900">
            {{ editingRole ? t('roles.editTitle') : t('roles.createTitle') }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal body -->
        <div class="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('roles.name') }}</label>
            <input
              v-model="form.name"
              type="text"
              :placeholder="t('roles.namePlaceholder')"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('roles.description') }}
              <span class="text-gray-400 font-normal">({{ t('roles.optional') }})</span>
            </label>
            <input
              v-model="form.description"
              type="text"
              :placeholder="t('roles.descriptionPlaceholder')"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Permissions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('roles.permissions') }}</label>
            <div class="space-y-3">
              <div v-for="(perms, group) in permissionGroups" :key="group">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 capitalize">
                  {{ group }}
                </p>
                <div class="grid grid-cols-2 gap-1.5">
                  <label
                    v-for="perm in perms"
                    :key="perm.id"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition"
                    :class="
                      form.permissions.includes(perm.id)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    "
                  >
                    <input
                      type="checkbox"
                      :checked="form.permissions.includes(perm.id)"
                      @change="togglePermission(perm.id)"
                      class="sr-only"
                    />
                    <span
                      class="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                      :class="
                        form.permissions.includes(perm.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      "
                    >
                      <svg
                        v-if="form.permissions.includes(perm.id)"
                        class="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span class="truncate">{{ perm.key.split('.')[1] }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
        </div>

        <!-- Modal footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            {{ t('roles.cancel') }}
          </button>
          <button
            @click="submitForm"
            :disabled="roleStore.saving || !form.name.trim()"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {{ roleStore.saving ? t('roles.saving') : t('roles.save') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

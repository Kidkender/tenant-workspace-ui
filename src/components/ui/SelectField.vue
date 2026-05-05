<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  required?: boolean
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      v-model="model"
      :required="required"
      :disabled="disabled"
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
    >
      <slot />
    </select>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>

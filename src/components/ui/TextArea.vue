<script setup lang="ts">
defineProps<{
  label?: string
  error?: string
  required?: boolean
  placeholder?: string
  rows?: number
  disabled?: boolean
}>()

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <textarea
      v-model="model"
      :placeholder="placeholder"
      :required="required"
      :rows="rows ?? 3"
      :disabled="disabled"
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none disabled:bg-gray-50 disabled:text-gray-400"
    />
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>

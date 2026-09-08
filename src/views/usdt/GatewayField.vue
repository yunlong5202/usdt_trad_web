<template>
  <el-switch v-if="field.type === 'boolean'" :model-value="Boolean(modelValue)" @update:model-value="emit('update:modelValue', $event)" />
  <el-input-number v-else-if="field.type === 'number'" :model-value="Number(modelValue || 0)" :min="0" @update:model-value="emit('update:modelValue', $event)" />
  <el-select v-else-if="field.type === 'select'" :model-value="String(modelValue ?? '')" clearable @update:model-value="emit('update:modelValue', $event)">
    <el-option v-for="option in field.options" :key="option" :label="option" :value="option" />
  </el-select>
  <el-input v-else :model-value="String(modelValue ?? '')" :type="field.type === 'lines' ? 'textarea' : field.type === 'password' ? 'password' : 'text'" :show-password="field.type === 'password'" :rows="4" autocomplete="off" @update:model-value="emit('update:modelValue', $event)" />
</template>
<script setup lang="ts">
import type { Field } from './schema'
defineProps<{ field: Field, modelValue: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>

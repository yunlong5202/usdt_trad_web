<template>
  <div v-if="field.type === 'mentions'" class="mention-fields">
    <p class="mention-help">{{ t('usdt.mentions.hint') }}</p>
    <el-form-item v-for="event in mentionEvents" :key="event" :label="t(`usdt.mentions.events.${event}`)">
      <el-input :model-value="String(mentions[event] ?? '')" :disabled="disabled" :placeholder="t('usdt.mentions.placeholder')" @update:model-value="emit('update:modelValue', { ...mentions, [event]: $event })" />
    </el-form-item>
  </div>
  <el-switch v-else-if="field.type === 'boolean'" :disabled="disabled" :model-value="Boolean(modelValue)" @update:model-value="emit('update:modelValue', $event)" />
  <el-input-number v-else-if="field.type === 'number'" :disabled="disabled" :model-value="Number(modelValue || 0)" :min="0" @update:model-value="emit('update:modelValue', $event)" />
  <el-select v-else-if="field.type === 'select'" :disabled="disabled" :model-value="String(modelValue ?? '')" clearable @update:model-value="emit('update:modelValue', $event)">
    <el-option v-for="option in field.options" :key="option" :label="te(`usdt.options.${option}`) ? t(`usdt.options.${option}`) : option" :value="option" />
  </el-select>
  <el-input v-else :disabled="disabled" :model-value="String(modelValue ?? '')" :type="field.type === 'lines' ? 'textarea' : field.type === 'password' ? 'password' : 'text'" :show-password="field.type === 'password'" :rows="4" autocomplete="off" @update:model-value="emit('update:modelValue', $event)" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Field } from './schema'
import { useI18n } from 'vue-i18n'
const { t, te } = useI18n()
const props = defineProps<{ field: Field, modelValue: unknown, disabled?: boolean }>()
const mentionEvents = ['deposit_created', 'deposit_confirmed', 'gas_low', 'address_pool_low', 'sweep_success', 'sweep_failed', 'deposit_callback_failed', 'test_notice']
const mentions = computed(() => props.modelValue && typeof props.modelValue === 'object' && !Array.isArray(props.modelValue) ? props.modelValue as Record<string, string> : {})
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
</script>
<style scoped>
.mention-fields { width: 100%; }
.mention-help { color: var(--el-text-color-secondary); line-height: 1.6; margin: 0 0 16px; }
.mention-fields :deep(.el-form-item) { margin-bottom: 16px; }
</style>

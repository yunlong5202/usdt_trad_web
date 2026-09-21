<template>
  <section v-loading="loading">
    <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" class="config-error" />
    <el-form ref="formRef" :model="values" :rules="rules" :disabled="loading || saving || !loaded" label-position="top" @submit.prevent="save">
      <el-card shadow="never">
        <template #header><h2>{{ t('usdt.runtime.addressTitle') }}</h2><p>{{ t('usdt.runtime.addressHint') }}</p></template>
        <el-form-item prop="DEFAULT_ADDRESS_ASSIGNMENT_MODE" :label="t('usdt.runtime.addressMode')">
          <el-radio-group v-model="values.DEFAULT_ADDRESS_ASSIGNMENT_MODE" class="address-modes">
            <el-radio v-for="mode in modes" :key="mode" :value="mode" border>
              <span class="mode-copy"><strong>{{ t(`usdt.runtime.modes.${mode}.title`) }}</strong><span>{{ t(`usdt.runtime.modes.${mode}.hint`) }}</span></span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-alert :title="t('usdt.runtime.addressChangeHint')" type="info" :closable="false" show-icon />
        <el-button v-if="router.hasRoute('USDTMemberAddresses')" class="member-link" link type="primary" @click="router.push({ name: 'USDTMemberAddresses' })">{{ t('usdt.runtime.viewBindings') }} <el-icon><ArrowRight /></el-icon></el-button>
      </el-card>
      <el-card v-for="group in groups" :key="group.key" shadow="never">
        <template #header><h2>{{ t(`usdt.systemConfig.groups.${group.key}.title`) }}</h2><p>{{ t(`usdt.systemConfig.groups.${group.key}.hint`) }}</p></template>
        <div class="config-grid">
          <el-form-item v-for="key in group.keys" :key="key" :prop="key" :label="t(`usdt.systemConfig.fields.${key}.label`)">
            <el-switch v-if="metadata[key]?.value_type === 'bool'" v-model="values[key]" active-value="true" inactive-value="false" :disabled="metadata[key]?.editable === false" />
            <el-input v-else v-model="values[key]" :type="metadata[key]?.sensitive ? 'password' : metadata[key]?.value_type === 'int' ? 'number' : 'text'" :min="metadata[key]?.value_type === 'int' ? 1 : undefined" :step="metadata[key]?.value_type === 'int' ? 1 : undefined" :show-password="metadata[key]?.sensitive" :autocomplete="metadata[key]?.sensitive ? 'new-password' : 'off'" :placeholder="metadata[key]?.sensitive ? t(metadata[key]?.secret_saved ? 'usdt.systemConfig.secretSaved' : 'usdt.systemConfig.secretEmpty') : undefined" :disabled="metadata[key]?.editable === false || key === 'ADMIN_API_KEY'" />
            <p class="field-help">{{ t(`usdt.systemConfig.fields.${key}.hint`) }}</p>
          </el-form-item>
        </div>
      </el-card>
      <footer class="config-footer">
        <span>{{ loaded ? t(dirty ? 'usdt.runtime.unsaved' : 'usdt.runtime.savedState') : t('common.loading') }}</span>
        <div class="config-actions">
          <el-button :disabled="saving || loading" @click="refresh">{{ t(dirty ? 'usdt.runtime.discard' : 'common.refresh') }}</el-button>
          <el-button v-permisaction="['usdt:settings:write']" type="primary" native-type="submit" :loading="saving" :disabled="!loaded || loading || !dirty">{{ t('usdt.systemConfig.save') }}</el-button>
        </div>
      </footer>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import { computed, onDeactivated, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getSystemConfig, updateSystemConfig, type SystemConfigItem } from '@/api/usdt-settings'
import { asReportedError } from '@/utils/request'

const { t } = useI18n()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const loaded = ref(false)
const loadError = ref('')
const metadata = reactive<Record<string, SystemConfigItem>>({})
const values = reactive<Record<string, string>>({})
const originals = reactive<Record<string, string>>({})
const modes = ['one_order', 'member_reuse', 'app_reuse'] as const
const groups = [
  { key: 'merchant', keys: ['MERCHANT_API_SIGNATURE_ENABLED', 'MERCHANT_API_KEY', 'MERCHANT_API_SECRET', 'MERCHANT_API_SIGNATURE_MAX_SKEW_SECONDS'] },
  { key: 'callback', keys: ['CALLBACK_SIGNATURE_ENABLED', 'CALLBACK_SIGNING_SECRET', 'CALLBACK_TIMEZONE', 'CALLBACK_HTTP_TIMEOUT_SECONDS', 'CALLBACK_WORKER_INTERVAL_SECONDS', 'CALLBACK_WORKER_BATCH_SIZE', 'CALLBACK_MAX_ATTEMPTS', 'CALLBACK_RETRY_BASE_SECONDS', 'CALLBACK_RETRY_MAX_SECONDS'] },
  { key: 'chain', keys: ['WORKER_SCAN_CHUNK_CONCURRENCY', 'BSC_FALLBACK_RPC_URL', 'GETBLOCK_ACCESS_TOKEN', 'TRON_SCAN_ADDRESS_LIMIT', 'TRON_SCAN_CONCURRENCY', 'TRONGRID_API_BASE', 'TRONGRID_API_KEY', 'TRONSCAN_API_BASE', 'TRONSCAN_API_KEY'] },
  { key: 'management', keys: ['TOTP_ISSUER', 'TOTP_ACCOUNT', 'ADMIN_API_KEY', 'SQL_LOG_ENABLED'] }
]
const keys = ['DEFAULT_ADDRESS_ASSIGNMENT_MODE', ...groups.flatMap(group => group.keys)]
const dirty = computed(() => keys.some(key => values[key] !== originals[key]))
const rules = computed<FormRules>(() => Object.fromEntries(keys.filter(key => metadata[key]?.value_type === 'int').map(key => [key, [{
  validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) <= 0) callback(new Error(t('usdt.runtime.positiveNumber')))
    else callback()
  }, trigger: 'blur'
}]])))

function accept(items: SystemConfigItem[]) {
  for (const item of items) {
    metadata[item.key] = item
    values[item.key] = item.sensitive ? '' : item.value
    originals[item.key] = values[item.key]
  }
  const missing = keys.filter(key => !metadata[key])
  loaded.value = missing.length === 0
  loadError.value = missing.length ? t('usdt.systemConfig.missing', { keys: missing.join(', ') }) : ''
  formRef.value?.clearValidate()
}

async function load() {
  if (loading.value) return
  loading.value = true
  try { accept((await getSystemConfig()).data.items) } catch(error) { loadError.value = asReportedError(error).message; loaded.value = false } finally { loading.value = false }
}

async function refresh() {
  if (saving.value || loading.value) return
  if (dirty.value) {
    try { await ElMessageBox.confirm(t('usdt.runtime.discardConfirm'), t('common.notice'), { confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel') }) } catch { return }
  }
  await load()
}

async function save() {
  if (saving.value || loading.value || !loaded.value || !dirty.value) return
  saving.value = true
  try {
    if (!await formRef.value?.validate().catch(() => false)) return
    const items = keys.filter(key => key !== 'ADMIN_API_KEY' && metadata[key]?.editable && values[key] !== originals[key] && (!metadata[key]?.sensitive || values[key].trim())).map(key => ({ key, value: values[key].trim() }))
    accept((await updateSystemConfig(items)).data.items)
    ElMessage.success(t('usdt.runtime.saveSuccess'))
  } catch(error) { loadError.value = asReportedError(error).message } finally { saving.value = false; clearSecrets() }
}

function clearSecrets() {
  for (const key of keys) if (metadata[key]?.sensitive) values[key] = ''
}

onMounted(load)
onDeactivated(clearSecrets)
</script>

<style scoped>
h2 { margin: 0; font-size: 17px; font-weight: 600; }
p { margin: 8px 0 0; color: var(--el-text-color-secondary); line-height: 1.7; }
.config-error { margin-bottom: 20px; }
.config-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 36px; }
.address-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; width: 100%; }
.address-modes :deep(.el-radio) { align-items: flex-start; height: auto; margin: 0; min-width: 0; padding: 20px 16px; white-space: normal; }
.address-modes :deep(.el-radio__input) { margin-top: 3px; }
.address-modes :deep(.el-radio__label) { min-width: 0; padding-left: 10px; }
.mode-copy { display: flex; flex-direction: column; gap: 9px; line-height: 1.6; }
.mode-copy strong { font-size: 16px; }
.mode-copy > span { color: var(--el-text-color-secondary); }
.member-link { margin-top: 16px; }
.field-help { width: 100%; font-size: 12px; margin-top: 8px; }
.config-footer { position: sticky; bottom: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px; margin-top: 20px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; box-shadow: 0 -4px 18px rgb(0 0 0 / 3%); }
.config-footer > span { color: var(--el-text-color-secondary); font-size: 13px; }
.config-actions { display: flex; gap: 10px; flex-shrink: 0; }
.config-actions :deep(.el-button + .el-button) { margin-left: 0; }
@media (max-width: 1000px) { .address-modes { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 767px) {
  .config-grid { grid-template-columns: minmax(0, 1fr); }
  .config-footer { align-items: stretch; flex-direction: column; padding: 14px; gap: 10px; }
  .config-actions { flex-wrap: wrap; }
  .config-actions .el-button { flex: 1; }
}
</style>

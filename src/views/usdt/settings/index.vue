<template>
  <PageContainer>
    <header class="settings-heading">
      <div><h1>{{ t('usdt.runtime.title') }}</h1><p>{{ t('usdt.runtime.intro') }}</p></div>
    </header>
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('usdt.runtime.integrationTab')" name="integration"><SystemConfigSettings /></el-tab-pane>
      <el-tab-pane :label="t('usdt.runtime.runtimeTab')" name="runtime">
        <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" class="settings-error" />
        <el-form ref="formRef" v-loading="loading" :model="model" :rules="rules" :disabled="loading || saving || !loaded" label-position="top" @submit.prevent="save">
          <el-card shadow="never">
            <template #header><h2>{{ t('usdt.runtime.orderTitle') }}</h2><p>{{ t('usdt.runtime.orderHint') }}</p></template>
            <div class="settings-grid">
              <el-form-item prop="default_deposit_expire_minutes" :label="t('usdt.fields.default_deposit_expire_minutes')">
                <el-input-number v-model="model.default_deposit_expire_minutes" :min="1" :precision="0" controls-position="right" />
                <p class="field-help">{{ t('usdt.runtime.expiryHint') }}</p>
              </el-form-item>
              <el-form-item prop="deposit_underpay_tolerance_rate" :label="t('usdt.runtime.toleranceLabel')">
                <div class="number-unit"><el-input-number :model-value="tolerancePercent" disabled :precision="6" controls-position="right" /><span>%</span></div>
                <p class="field-help">{{ t('usdt.runtime.toleranceHint', { amount: tolerancePercent ?? 0 }) }}</p>
              </el-form-item>
            </div>
          </el-card>
          <el-card shadow="never">
            <template #header><h2>{{ t('usdt.runtime.accessTitle') }}</h2><p>{{ t('usdt.runtime.accessHint') }}</p></template>
            <div class="settings-grid">
              <el-form-item :label="t('usdt.fields.admin_ui_whitelist_ips')">
                <el-input v-model="model.admin_ui_whitelist_ips" type="textarea" :rows="3" :placeholder="t('usdt.runtime.whitelistPlaceholder')" />
                <p class="field-help">{{ t('usdt.runtime.adminWhitelistHint') }}</p>
              </el-form-item>
              <el-form-item :label="t('usdt.fields.order_whitelist_ips')">
                <el-input v-model="model.order_whitelist_ips" type="textarea" :rows="3" :placeholder="t('usdt.runtime.whitelistPlaceholder')" />
                <p class="field-help">{{ t('usdt.runtime.orderWhitelistHint') }}</p>
              </el-form-item>
            </div>
          </el-card>
          <el-card shadow="never">
            <template #header><h2>{{ t('usdt.runtime.scanTitle') }}</h2><p>{{ t('usdt.runtime.scanHint') }}</p></template>
            <div class="settings-grid">
              <el-form-item prop="worker_scan_interval_seconds" :label="t('usdt.fields.worker_scan_interval_seconds')">
                <el-input-number v-model="model.worker_scan_interval_seconds" :min="1" :precision="0" controls-position="right" />
                <p class="field-help">{{ t('usdt.runtime.scanIntervalHint') }}</p>
              </el-form-item>
              <el-form-item prop="bsc_scan_lookback_blocks" :label="t('usdt.fields.bsc_scan_lookback_blocks')">
                <el-input-number v-model="model.bsc_scan_lookback_blocks" :min="1" :precision="0" controls-position="right" />
                <p class="field-help">{{ t('usdt.runtime.lookbackHint') }}</p>
              </el-form-item>
            </div>
          </el-card>
          <el-card shadow="never">
            <template #header><h2>{{ t('usdt.runtime.tronTitle') }}</h2><p>{{ t('usdt.runtime.tronHint') }}</p></template>
            <div class="settings-grid">
              <el-form-item prop="trc_batch_gas_contract_address" :label="t('usdt.fields.trc_batch_gas_contract_address')">
                <el-input v-model="model.trc_batch_gas_contract_address" clearable />
                <p class="field-help">{{ t('usdt.runtime.contractHint') }}</p>
              </el-form-item>
              <el-form-item prop="tron_grpc_endpoint" :label="t('usdt.fields.tron_grpc_endpoint')">
                <el-input v-model="model.tron_grpc_endpoint" clearable />
                <p class="field-help">{{ t('usdt.runtime.grpcHint') }}</p>
              </el-form-item>
            </div>
          </el-card>
          <footer class="settings-footer">
            <span class="save-state">{{ loaded ? t(dirty ? 'usdt.runtime.unsaved' : 'usdt.runtime.savedState') : t('common.loading') }}</span>
            <div class="settings-actions">
              <el-button :disabled="saving || loading" @click="refresh">{{ t(dirty ? 'usdt.runtime.discard' : 'common.refresh') }}</el-button>
              <el-button v-permisaction="['usdt:settings:write']" type="primary" native-type="submit" :loading="saving" :disabled="!loaded || loading || !dirty">{{ t('usdt.operations.saveRuntime') }}</el-button>
            </div>
          </footer>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer/index.vue'
import { getRuntimeSettings, updateRuntimeSettings, type RuntimeSettings } from '@/api/usdt-settings'
import { asReportedError } from '@/utils/request'
import SystemConfigSettings from './SystemConfigSettings.vue'

defineOptions({ name: 'USDTSettings' })
const { t } = useI18n()
const activeTab = ref('integration')
const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const loaded = ref(false)
const loadError = ref('')
const saved = ref('')
const model = reactive<RuntimeSettings>({
  admin_ui_whitelist_ips: '', order_whitelist_ips: '',
  default_deposit_expire_minutes: 30, deposit_underpay_tolerance_rate: '0.002',
  worker_scan_interval_seconds: 10, bsc_scan_lookback_blocks: 1000,
  trc_batch_gas_contract_address: '', tron_grpc_endpoint: ''
})
const dirty = computed(() => loaded.value && JSON.stringify(model) !== saved.value)
const tolerancePercent = computed(() => model.deposit_underpay_tolerance_rate === '' ? undefined : Number((Number(model.deposit_underpay_tolerance_rate) * 100).toFixed(6)))
const rules = computed<FormRules>(() => ({
  default_deposit_expire_minutes: [{ required: true, type: 'number', min: 1, message: t('usdt.runtime.positiveNumber'), trigger: 'blur' }],
  worker_scan_interval_seconds: [{ required: true, type: 'number', min: 1, message: t('usdt.runtime.positiveNumber'), trigger: 'blur' }],
  bsc_scan_lookback_blocks: [{ required: true, type: 'number', min: 1, message: t('usdt.runtime.positiveNumber'), trigger: 'blur' }]
}))

function accept(data: RuntimeSettings) {
  Object.assign(model, data)
  saved.value = JSON.stringify(model)
  loaded.value = true
  loadError.value = ''
  formRef.value?.clearValidate()
}

async function load() {
  if (loading.value) return
  loading.value = true
  try { accept((await getRuntimeSettings()).data) } catch(error) { loadError.value = asReportedError(error).message; loaded.value = false } finally { loading.value = false }
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
    accept((await updateRuntimeSettings({ ...model })).data)
    ElMessage.success(t('usdt.runtime.saveSuccess'))
  } catch(error) { loadError.value = asReportedError(error).message } finally { saving.value = false }
}

onMounted(load)
</script>

<style scoped>
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
h1 { margin: 0 0 8px; font-size: 25px; font-weight: 650; }
h2 { margin: 0; font-size: 17px; font-weight: 600; }
p { margin: 8px 0 0; color: var(--el-text-color-secondary); line-height: 1.7; }
.settings-error { margin-bottom: 20px; }
.settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 36px; }
.field-help { width: 100%; font-size: 12px; margin-top: 8px; }
.number-unit { display: flex; align-items: center; gap: 10px; }
.settings-footer { position: sticky; bottom: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 22px; margin-top: 20px; background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; box-shadow: 0 -4px 18px rgb(0 0 0 / 3%); }
.save-state { color: var(--el-text-color-secondary); font-size: 13px; }
.settings-actions { display: flex; gap: 10px; flex-shrink: 0; }
.settings-actions :deep(.el-button + .el-button) { margin-left: 0; }
@media (max-width: 767px) {
  .settings-grid { grid-template-columns: minmax(0, 1fr); }
  .settings-heading { align-items: flex-start; gap: 12px; }
  h1 { font-size: 22px; }
  .settings-footer { align-items: stretch; flex-direction: column; padding: 14px; gap: 10px; }
  .settings-actions { flex-wrap: wrap; }
  .settings-actions .el-button { flex: 1; }
}
</style>

<template>
  <PageContainer>
    <header class="security-heading">
      <div><h1>{{ t('usdt.security.title') }}</h1><p>{{ t('usdt.security.intro') }}</p></div>
      <el-button :loading="loading" :disabled="busy" @click="load">{{ t('common.refresh') }}</el-button>
    </header>
    <el-alert v-if="loadError || actionError" :title="loadError || actionError" type="error" :closable="false" class="security-error" />
    <el-card v-loading="loading" shadow="never">
      <div class="security-status">
        <span class="security-icon"><el-icon :size="30"><Lock /></el-icon></span>
        <div class="status-copy">
          <h2>{{ t('usdt.security.authenticator') }} <el-tag v-if="status" :type="bound ? 'success' : 'warning'">{{ t(bound ? 'usdt.security.bound' : 'usdt.security.unbound') }}</el-tag></h2>
          <p>{{ t(bound ? 'usdt.security.boundHint' : 'usdt.security.unboundHint') }}</p>
        </div>
      </div>
      <el-descriptions v-if="status" :column="1" class="account-details">
        <el-descriptions-item :label="t('usdt.security.currentAccount')">{{ status.username || '—' }}</el-descriptions-item>
        <el-descriptions-item :label="t('usdt.fields.totp_bound_at')"><DateCell v-if="bound && status.totp_bound_at && !status.totp_bound_at.startsWith('0001')" :value="status.totp_bound_at" /><span v-else>—</span></el-descriptions-item>
      </el-descriptions>
      <el-alert v-if="status?.scope === 'legacy' && bound" :title="t('usdt.security.legacyHint')" type="info" :closable="false" show-icon />
    </el-card>

    <el-card v-if="status && !bound && !loadError" shadow="never">
      <template #header><h2>{{ t('usdt.security.bindTitle') }}</h2><p>{{ t('usdt.security.bindHint') }}</p></template>
      <div v-if="!setup" class="setup-start">
        <el-icon :size="42"><Cellphone /></el-icon>
        <p>{{ t('usdt.security.startHint') }}</p>
        <el-button v-permisaction="['usdt:security:write']" type="primary" :loading="busy" @click="generate">{{ t('usdt.security.start') }}</el-button>
      </div>
      <div v-else class="bind-grid">
        <div class="qr-column">
          <h3>{{ t('usdt.security.stepScan') }}</h3>
          <img v-if="setup.qr_svg_data_uri" :src="setup.qr_svg_data_uri" :alt="t('usdt.security.qrAlt')" class="totp-qr">
          <p>{{ setup.issuer }} · {{ setup.account }}</p>
          <p class="secret-label">{{ t('usdt.security.manualKey') }}</p>
          <code class="totp-secret">{{ setup.secret }}</code>
        </div>
        <el-form ref="bindFormRef" :model="bindForm" :rules="codeRules" label-position="top" class="verification-form" :disabled="busy" @submit.prevent="bind">
          <h3>{{ t('usdt.security.stepVerify') }}</h3><p>{{ t('usdt.security.codeHint') }}</p>
          <el-form-item prop="code" :label="t('usdt.fields.verify_code')">
            <el-input v-model="bindForm.code" :maxlength="6" inputmode="numeric" autocomplete="one-time-code" :placeholder="t('usdt.security.codePlaceholder')" class="code-input" />
          </el-form-item>
          <el-button v-permisaction="['usdt:security:write']" type="primary" native-type="submit" :loading="busy">{{ t('usdt.security.bind') }}</el-button>
          <el-button :disabled="busy" @click="clearSetup">{{ t('common.cancel') }}</el-button>
        </el-form>
      </div>
    </el-card>

    <el-card v-if="status && bound && !loadError" shadow="never">
      <template #header><h2>{{ t('usdt.security.replaceTitle') }}</h2><p>{{ t('usdt.security.replaceHint') }}</p></template>
      <el-form ref="unbindFormRef" :model="unbindForm" :rules="codeRules" label-position="top" class="unbind-form" :disabled="busy" @submit.prevent="unbind">
        <el-form-item prop="code" :label="t('usdt.security.currentCode')">
          <el-input v-model="unbindForm.code" :maxlength="6" inputmode="numeric" autocomplete="one-time-code" :placeholder="t('usdt.security.codePlaceholder')" class="code-input" />
        </el-form-item>
        <el-button v-permisaction="['usdt:security:write']" type="danger" plain native-type="submit" :loading="busy">{{ t('usdt.operations.unbindTotp') }}</el-button>
      </el-form>
    </el-card>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageContainer from '@/components/PageContainer/index.vue'
import DateCell from '@/components/DateCell/index.vue'
import { bindTotp, getTotpStatus, setupTotp, unbindTotp, type TotpSetup, type TotpStatus } from '@/api/usdt-settings'
import { asReportedError } from '@/utils/request'

defineOptions({ name: 'USDTSecurity' })
const { t } = useI18n()
const loading = ref(false)
const busy = ref(false)
const loadError = ref('')
const actionError = ref('')
const status = ref<TotpStatus>()
const setup = ref<TotpSetup>()
const bound = computed(() => Boolean(status.value?.totp_enabled || status.value?.totp_secret_saved))
const bindFormRef = ref<FormInstance>()
const unbindFormRef = ref<FormInstance>()
const bindForm = reactive({ code: '' })
const unbindForm = reactive({ code: '' })
const codeRules = computed<FormRules>(() => ({ code: [{ required: true, pattern: /^\d{6}$/, message: t('usdt.security.invalidCode'), trigger: 'blur' }] }))
let active = true

async function load() {
  if (loading.value) return
  loading.value = true
  try {
    status.value = (await getTotpStatus()).data
    loadError.value = ''
    if (bound.value) clearSetup()
  } catch(error) { loadError.value = asReportedError(error).message } finally { loading.value = false }
}

function clearSetup() { setup.value = undefined; bindForm.code = ''; bindFormRef.value?.clearValidate() }
function clearSecrets() { active = false; clearSetup(); unbindForm.code = '' }

async function generate() {
  if (busy.value || loading.value || !status.value || bound.value || loadError.value) return
  busy.value = true
  actionError.value = ''
  try {
    const data = (await setupTotp()).data
    if (active) setup.value = data
  } catch(error) { actionError.value = asReportedError(error).message } finally { busy.value = false }
}

async function bind() {
  if (busy.value || !setup.value || bound.value) return
  busy.value = true
  actionError.value = ''
  try {
    if (!await bindFormRef.value?.validate().catch(() => false)) return
    status.value = { ...status.value, ...(await bindTotp(setup.value.secret, bindForm.code)).data }
    clearSetup()
    ElMessage.success(t('usdt.security.bindSuccess'))
    await load()
  } catch(error) { actionError.value = asReportedError(error).message } finally { busy.value = false; bindForm.code = '' }
}

async function unbind() {
  if (busy.value || !bound.value) return
  busy.value = true
  actionError.value = ''
  try {
    if (!await unbindFormRef.value?.validate().catch(() => false)) return
    await ElMessageBox.confirm(t('usdt.security.unbindConfirm'), t('usdt.operations.unbindTotp'), { type: 'warning', confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel') })
    try {
      status.value = { ...status.value, ...(await unbindTotp(unbindForm.code)).data }
      clearSetup()
      ElMessage.success(t('usdt.security.unbindSuccess'))
      await load()
    } catch(error) { actionError.value = asReportedError(error).message }
  } catch { /* A dismissed confirmation leaves the binding intact. */ } finally { busy.value = false; unbindForm.code = '' }
}

onMounted(load)
onActivated(() => { active = true; void load() })
onDeactivated(clearSecrets)
onBeforeUnmount(clearSecrets)
</script>

<style scoped>
.security-heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 24px; }
h1 { margin: 0 0 8px; font-size: 25px; font-weight: 650; }
h2 { margin: 0; font-size: 17px; line-height: 1.8; }
h3 { margin: 0 0 16px; font-size: 15px; }
p { margin: 8px 0 0; color: var(--el-text-color-secondary); line-height: 1.7; }
.security-error { margin-bottom: 20px; }
.security-status { display: flex; align-items: center; gap: 20px; }
.security-icon { display: grid; place-items: center; width: 64px; height: 64px; flex-shrink: 0; color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-radius: 18px; }
.status-copy { min-width: 0; }
.status-copy .el-tag { margin-left: 10px; }
.account-details { margin-top: 20px; }
.setup-start { text-align: center; padding: 24px 12px; }
.setup-start > .el-icon { color: var(--el-color-primary); }
.setup-start p { margin: 18px 0; }
.bind-grid { display: grid; grid-template-columns: minmax(240px, 1fr) minmax(240px, 1fr); gap: 36px; }
.qr-column { text-align: center; padding: 18px; background: var(--el-fill-color-extra-light); border-radius: 8px; }
.totp-qr { width: 200px; height: 200px; max-width: 100%; background: white; padding: 10px; }
.secret-label { font-size: 12px; }
.totp-secret { display: block; overflow-wrap: anywhere; user-select: all; margin-top: 8px; line-height: 1.7; }
.verification-form { padding-top: 18px; }
.verification-form > p { margin-bottom: 24px; }
.code-input { max-width: 300px; }
.code-input :deep(input) { letter-spacing: 6px; font-size: 18px; }
.code-input :deep(input::placeholder) { font-size: 14px; letter-spacing: normal; }
.unbind-form { max-width: 340px; }
@media (max-width: 767px) {
  .security-heading { align-items: flex-start; gap: 12px; }
  h1 { font-size: 22px; }
  .security-status { align-items: flex-start; gap: 12px; }
  .security-icon { width: 44px; height: 44px; border-radius: 12px; }
  .status-copy .el-tag { margin-left: 0; display: table; }
  .bind-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .verification-form { padding-top: 0; }
}
</style>

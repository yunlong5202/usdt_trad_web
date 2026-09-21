<template>
  <main class="login-page">
    <section class="stage" :aria-label="t('login.brand')">
      <div class="brand-lockup">
        <span class="brand-symbol" aria-hidden="true"><el-icon><Wallet /></el-icon></span>
        <span>{{ t('login.brand') }}</span>
      </div>
      <div class="stage-main">
        <p class="eyebrow">{{ t('login.businessLabel') }}</p>
        <h2>{{ t('login.heroTitle') }}</h2>
        <p class="stage-description">{{ t('login.heroDescription') }}</p>
        <ol class="payment-flow">
          <li><span class="flow-number">01</span><div><h3>{{ t('login.flowAddress') }}</h3><p>{{ t('login.flowAddressHint') }}</p></div></li>
          <li><span class="flow-number">02</span><div><h3>{{ t('login.flowConfirm') }}</h3><p>{{ t('login.flowConfirmHint') }}</p></div></li>
          <li><span class="flow-number">03</span><div><h3>{{ t('login.flowNotify') }}</h3><p>{{ t('login.flowNotifyHint') }}</p></div></li>
        </ol>
      </div>
      <div class="stage-foot"><span>BSC <b>BEP20</b></span><span>TRON <b>TRC20</b></span></div>
    </section>
    <section class="panel">
      <lang-select id="lang-select" class="lang-switch" />
      <div class="form-box">
        <div class="mobile-brand"><el-icon><Wallet /></el-icon>{{ t('login.brand') }}</div>
        <p class="form-eyebrow">{{ appName }}</p>
        <h1 class="panel-title">{{ t('login.title') }}</h1>
        <p class="panel-sub">{{ t('login.subtitle') }}</p>
        <div v-if="authConfigLoading" class="auth-status" role="status">
          <el-icon class="is-loading"><Loading /></el-icon>{{ t('login.authConfigLoading') }}
        </div>
        <div v-else-if="authConfigError" class="auth-error" role="alert">
          <p>{{ t('login.authConfigError') }}</p>
          <button type="button" @click="loadAuthConfig">{{ t('login.retry') }}</button>
        </div>
        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          :validate-on-rule-change="false"
          :disabled="loading"
          label-position="top"
          class="login-form"
          autocomplete="on"
          @submit.prevent="handleLogin"
        >
          <el-form-item :label="t('login.username')" prop="username">
            <el-input ref="usernameRef" v-model="loginForm.username" :placeholder="t('login.usernamePlaceholder')" name="username" autocomplete="username" size="large" :prefix-icon="User" />
          </el-form-item>
          <el-form-item :label="t('login.password')" prop="password">
            <el-input v-model="loginForm.password" :placeholder="t('login.passwordPlaceholder')" name="password" type="password" autocomplete="current-password" show-password size="large" :prefix-icon="Lock" />
          </el-form-item>
          <el-form-item :label="t('login.captcha')" prop="code">
            <div class="captcha-row">
              <el-input v-model="loginForm.code" :placeholder="t('login.captchaPlaceholder')" name="code" maxlength="5" autocomplete="off" size="large" :prefix-icon="Picture" />
              <button type="button" class="captcha-wrap" :title="t('login.captchaRefresh')" :aria-label="t('login.captchaRefresh')" :disabled="captchaLoading || loading" @click="getCode">
                <img v-if="codeUrl" :src="codeUrl" class="captcha-img" :alt="t('login.captcha')">
                <el-icon v-else-if="captchaLoading" class="is-loading"><Loading /></el-icon>
                <span v-else>{{ t('login.retry') }}</span>
              </button>
            </div>
            <span v-if="captchaError" class="field-error" role="alert">{{ t('login.captchaError') }}</span>
          </el-form-item>
          <el-form-item v-if="totpEnabled" :label="t('login.totp')" prop="totp_code">
            <el-input v-model="loginForm.totp_code" name="totp_code" :placeholder="t('login.totpPlaceholder')" autocomplete="one-time-code" inputmode="numeric" maxlength="6" size="large" :prefix-icon="Key" aria-describedby="totp-hint" />
            <p id="totp-hint" class="field-hint">{{ t('login.totpHint') }}</p>
          </el-form-item>
          <el-button :loading="loading" :disabled="!readyToLogin" native-type="submit" size="large" class="submit-btn">
            {{ loading ? t('login.submitting') : t('login.submit') }}<el-icon v-if="!loading"><ArrowRight /></el-icon>
          </el-button>
        </el-form>
        <p class="panel-tip"><el-icon><Lock /></el-icon>{{ t('login.forgotPassword') }}</p>
      </div>
      <a v-if="icp" href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" class="icp">{{ icp }}</a>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules, InputInstance } from 'element-plus'
import { User, Lock, Key, Picture, Wallet, ArrowRight, Loading } from '@element-plus/icons-vue'
import { getAuthConfig, getCodeImg } from '@/api/login'
import { useSystemStore } from '@/stores/system'
import { useUserStore } from '@/stores/user'
import LangSelect from '@/components/LangSelect/index.vue'

defineOptions({ name: 'LoginPage' })
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const system = useSystemStore()
const user = useUserStore()
const formRef = ref<FormInstance>()
const usernameRef = ref<InputInstance>()
const loginForm = reactive({ username: '', password: '', code: '', uuid: '', totp_code: '' })
const loading = ref(false)
const codeUrl = ref('')
const captchaLoading = ref(false)
const captchaError = ref(false)
const authConfigLoading = ref(true)
const authConfigError = ref(false)
const totpEnabled = ref<boolean | null>(null)
const authUsername = ref<string | null>(null)
let authRequestVersion = 0
let authTimer: ReturnType<typeof setTimeout> | undefined
const icp = (process.env as Record<string, string | undefined>).VUE_APP_ICP || ''
const appName = computed(() => {
  const name = system.info?.sys_app_name
  return name && name !== 'go-admin' ? name : t('login.brand')
})
const readyToLogin = computed(() => !authConfigLoading.value && !authConfigError.value &&
  authUsername.value === loginForm.username.trim() && totpEnabled.value !== null &&
  !!codeUrl.value && !!loginForm.uuid && !captchaLoading.value)
const loginRules = computed<FormRules>(() => ({
  username: [{ required: true, trigger: 'blur', message: t('login.rules.username') }],
  password: [{ required: true, trigger: 'blur', message: t('login.rules.password') }],
  code: [{ required: true, trigger: 'blur', message: t('login.rules.captcha') }],
  totp_code: totpEnabled.value
    ? [{ required: true, pattern: '^\\d{6}$', trigger: 'blur', message: t('login.rules.totp') }]
    : []
}))

async function loadAuthConfig() {
  clearTimeout(authTimer)
  const version = ++authRequestVersion
  const username = loginForm.username.trim()
  authConfigLoading.value = true
  authConfigError.value = false
  try {
    const response = await getAuthConfig(username)
    if (version !== authRequestVersion) return
    if (typeof response.data?.totp_enabled !== 'boolean') throw new Error('Invalid authentication configuration')
    totpEnabled.value = response.data.totp_enabled
    authUsername.value = username
  } catch {
    if (version !== authRequestVersion) return
    // Unknown requirements must never be treated as two-factor authentication off.
    authConfigError.value = true
    totpEnabled.value = null
    authUsername.value = null
  } finally {
    if (version === authRequestVersion) authConfigLoading.value = false
  }
}

watch(() => loginForm.username, () => {
  // A previous account's requirements cannot authorize this account's login.
  ++authRequestVersion
  clearTimeout(authTimer)
  authUsername.value = null
  totpEnabled.value = null
  loginForm.totp_code = ''
  authConfigError.value = false
  authConfigLoading.value = true
  authTimer = setTimeout(() => { void loadAuthConfig() }, 300)
}, { flush: 'sync' })

onBeforeUnmount(() => {
  ++authRequestVersion
  clearTimeout(authTimer)
})

async function getCode() {
  if (captchaLoading.value) return
  captchaLoading.value = true
  captchaError.value = false
  codeUrl.value = ''
  loginForm.code = ''
  loginForm.uuid = ''
  try {
    const response = await getCodeImg()
    if (!response.id || typeof response.data !== 'string' || !response.data) throw new Error('Invalid captcha')
    codeUrl.value = response.data
    loginForm.uuid = response.id
  } catch {
    captchaError.value = true
  } finally {
    captchaLoading.value = false
  }
}

async function handleLogin() {
  if (loading.value || !readyToLogin.value || !formRef.value) return
  loading.value = true
  let attempted = false
  try {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    attempted = true
    await user.login({
      username: loginForm.username.trim(),
      password: loginForm.password,
      code: loginForm.code,
      uuid: loginForm.uuid,
      ...(totpEnabled.value ? { totp_code: loginForm.totp_code } : {})
    })
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') &&
      !route.query.redirect.startsWith('//') ? route.query.redirect : '/'
    const query = Object.fromEntries(Object.entries(route.query).filter(([key]) => key !== 'redirect'))
    await router.push({ path: redirect, query })
  } catch {
    // The HTTP client reports the server message. Every new attempt gets fresh challenges.
    await Promise.all([loadAuthConfig(), getCode()])
  } finally {
    if (attempted) loginForm.totp_code = ''
    loading.value = false
  }
}

onMounted(() => {
  usernameRef.value?.focus()
  void loadAuthConfig()
  void getCode()
  document.title = appName.value
  void system.settingDetail().then(() => { document.title = appName.value }).catch(() => {
    // Branding is optional; authentication requirements above are mandatory.
  })
})
</script>

<style lang="scss" scoped>
.login-page {
  --login-accent: #078775;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(440px, 1fr);
  min-height: 100vh;
  min-height: 100dvh;
  color: #172b3d;
  background: #f8fafb;
}
.stage { display: flex; flex-direction: column; padding: 52px clamp(40px, 5vw, 90px); color: #f2f7fa; background: #102a3b; }
.brand-lockup { display: flex; align-items: center; gap: 12px; font-size: 19px; font-weight: 650; letter-spacing: -.4px; }
.brand-symbol { display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid #466777; border-radius: 10px; color: #79d6c0; font-size: 21px; }
.stage-main { width: 100%; max-width: 460px; margin: auto 0; padding: 56px 0; }
.eyebrow, .form-eyebrow { margin: 0 0 22px; font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #8cc6bd; }
.stage h2 { margin: 0; font-size: clamp(34px, 3.1vw, 48px); line-height: 1.35; letter-spacing: -1px; font-weight: 600; }
.stage-description { max-width: 400px; margin: 22px 0 38px; font-size: 15px; line-height: 1.9; color: #b1c4ce; }
.payment-flow { margin: 0; padding: 0; list-style: none; }
.payment-flow li { display: flex; gap: 18px; padding: 20px 0; border-top: 1px solid #2b4657; }
.flow-number { padding-top: 3px; font-size: 12px; color: #83bfba; font-variant-numeric: tabular-nums; }
.payment-flow h3 { margin: 0 0 7px; font-size: 15px; font-weight: 500; }
.payment-flow p { margin: 0; font-size: 12px; line-height: 1.7; color: #9fb6c3; }
.stage-foot { display: flex; gap: 28px; font-size: 12px; color: #d1e0e7; }
.stage-foot b { margin-left: 7px; font-weight: 400; font-size: 10px; letter-spacing: .7px; color: #8ca7b5; }
.panel { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 0; padding: 84px 40px 60px; }
.lang-switch { position: absolute; top: 30px; right: 32px; color: #506370; }
.form-box { width: 100%; max-width: 360px; }
.mobile-brand { display: none; }
.form-eyebrow { margin-bottom: 14px; color: var(--login-accent); letter-spacing: 1px; }
.panel-title { margin: 0; color: #172b3d; font-size: 29px; font-weight: 650; line-height: 1.35; }
.panel-sub { margin: 10px 0 30px; font-size: 13px; line-height: 1.7; color: #627580; }
.auth-status { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; color: #627580; font-size: 12px; }
.auth-error { margin-bottom: 22px; padding: 12px 14px; color: #9a392d; background: #fff2ee; border: 1px solid #efd6cf; border-radius: 8px; font-size: 12px; line-height: 1.65; }
.auth-error p { margin: 0 0 6px; }
.auth-error button { padding: 0; color: #9a392d; background: none; border: 0; cursor: pointer; text-decoration: underline; }
.login-form {
  :deep(.el-form-item) { margin-bottom: 23px; }
  :deep(.el-form-item__label) { padding-bottom: 7px; font-size: 13px; color: #334d5b; line-height: 1.3; }
  :deep(.el-input__wrapper) { border-radius: 7px; background: #fff; box-shadow: 0 0 0 1px #d6e0e5 inset; padding: 1px 13px; }
  :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px var(--login-accent) inset, 0 0 0 3px #07877512; }
  :deep(.el-input__inner) { height: 44px; color: #172b3d; font-size: 14px; }
  :deep(.el-input__inner::placeholder) { color: #8b9da7; }
  :deep(.el-input__prefix), :deep(.el-input__suffix) { color: #8398a4; }
  :deep(.submit-btn) { display: flex; justify-content: center; width: 100%; height: 46px; margin: 4px 0 0; border: 0; border-radius: 7px; color: #fff; background: var(--login-accent); font-size: 14px; font-weight: 600; }
  :deep(.submit-btn:hover:not(:disabled)) { background: #067565; }
  :deep(.submit-btn:focus-visible) { outline: 3px solid #82c8bb; outline-offset: 3px; }
  :deep(.submit-btn.is-disabled) { color: #f4f8f7; background: #9ab7b1; cursor: not-allowed; }
  :deep(.submit-btn .el-icon) { margin-left: 9px; }
}
.captcha-row { display: flex; gap: 12px; width: 100%; }
.captcha-row .el-input { flex: 1; min-width: 0; }
.captcha-wrap { flex: 0 0 108px; height: 46px; display: grid; place-items: center; padding: 0; border: 1px solid #d6e0e5; border-radius: 7px; overflow: hidden; color: #506370; background: #fff; cursor: pointer; }
.captcha-wrap:focus-visible { outline: 2px solid var(--login-accent); outline-offset: 2px; }
.captcha-wrap:disabled { cursor: wait; }
.captcha-img { width: 100%; height: 100%; object-fit: contain; }
.field-hint { margin: 7px 0 0; color: #6c808c; font-size: 11px; line-height: 1.6; }
.field-error { color: #b54736; font-size: 12px; line-height: 1.6; margin-top: 7px; }
.panel-tip { display: flex; gap: 7px; align-items: flex-start; margin: 24px 0 0; color: #7b8c96; font-size: 11px; line-height: 1.7; }
.panel-tip .el-icon { margin-top: 3px; flex-shrink: 0; }
.icp { margin-top: 40px; color: #7b8c96; font-size: 11px; }
@media (max-width: 900px) {
  .login-page { grid-template-columns: 1fr 1fr; }
  .stage { padding: 38px 30px; }
  .stage h2 { font-size: 32px; }
  .panel { padding: 74px 28px 44px; }
}
@media (max-width: 767px) {
  .login-page { display: flex; }
  .stage { display: none; }
  .panel { width: 100%; justify-content: flex-start; padding: 80px 28px 32px; }
  .lang-switch { top: 24px; right: 22px; }
  .mobile-brand { display: flex; align-items: center; gap: 8px; margin: 0 0 30px; color: #173d4d; font-size: 16px; font-weight: 600; }
  .mobile-brand .el-icon { color: var(--login-accent); font-size: 21px; }
  .form-eyebrow { display: none; }
  .panel-title { font-size: 27px; }
  .panel-sub { margin-bottom: 26px; }
}
@media (max-width: 380px) {
  .panel { padding-left: 22px; padding-right: 22px; }
}
</style>

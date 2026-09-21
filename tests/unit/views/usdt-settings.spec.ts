import { createRequire } from 'node:module'
import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import Security from '@/views/usdt/security/index.vue'
import SystemConfigSettings from '@/views/usdt/settings/SystemConfigSettings.vue'
import type { SystemConfigItem } from '@/api/usdt-settings'

const ElementPlus = createRequire(import.meta.url)('element-plus').default as typeof import('element-plus').default
const api = vi.hoisted(() => ({ status: vi.fn(), setup: vi.fn(), bind: vi.fn(), unbind: vi.fn(), getConfig: vi.fn(), saveConfig: vi.fn() }))
vi.mock('@/api/usdt-settings', () => ({ getTotpStatus: api.status, setupTotp: api.setup, bindTotp: api.bind, unbindTotp: api.unbind, getSystemConfig: api.getConfig, updateSystemConfig: api.saveConfig }))
vi.mock('vue-router', () => ({ useRouter: () => ({ hasRoute: () => true, push: vi.fn() }) }))

const wrappers: ReturnType<typeof mount>[] = []
const render = async(component: typeof Security | typeof SystemConfigSettings) => {
  const wrapper = mount(component, { global: { plugins: [ElementPlus], directives: { permisaction: {}}, stubs: { Lock: true, Cellphone: true, ArrowRight: true }}})
  wrappers.push(wrapper)
  await flushPromises()
  return wrapper
}

function configItems(): SystemConfigItem[] {
  const groups: Record<string, string[]> = {
    bool: ['MERCHANT_API_SIGNATURE_ENABLED', 'CALLBACK_SIGNATURE_ENABLED', 'SQL_LOG_ENABLED'],
    int: ['MERCHANT_API_SIGNATURE_MAX_SKEW_SECONDS', 'CALLBACK_HTTP_TIMEOUT_SECONDS', 'CALLBACK_WORKER_INTERVAL_SECONDS', 'CALLBACK_WORKER_BATCH_SIZE', 'CALLBACK_MAX_ATTEMPTS', 'CALLBACK_RETRY_BASE_SECONDS', 'CALLBACK_RETRY_MAX_SECONDS', 'WORKER_SCAN_CHUNK_CONCURRENCY', 'TRON_SCAN_ADDRESS_LIMIT', 'TRON_SCAN_CONCURRENCY'],
    secret: ['MERCHANT_API_KEY', 'MERCHANT_API_SECRET', 'CALLBACK_SIGNING_SECRET', 'GETBLOCK_ACCESS_TOKEN', 'TRONGRID_API_KEY', 'TRONSCAN_API_KEY', 'ADMIN_API_KEY'],
    string: ['DEFAULT_ADDRESS_ASSIGNMENT_MODE', 'CALLBACK_TIMEZONE', 'BSC_FALLBACK_RPC_URL', 'TRONGRID_API_BASE', 'TRONSCAN_API_BASE', 'TOTP_ISSUER', 'TOTP_ACCOUNT']
  }
  return Object.entries(groups).flatMap(([type, keys]) => keys.map(key => ({
    key, value: key === 'DEFAULT_ADDRESS_ASSIGNMENT_MODE' ? 'member_reuse' : type === 'int' ? '10' : type === 'bool' ? 'true' : '',
    value_type: type, description: '', editable: true, sensitive: type === 'secret', secret_saved: type === 'secret'
  })))
}

beforeEach(() => {
  vi.resetAllMocks()
  api.status.mockResolvedValue({ code: 200, data: { username: 'admin', scope: 'account', totp_enabled: false, totp_secret_saved: false }})
  api.setup.mockResolvedValue({ code: 200, data: { secret: 'TESTONLYSECRET', issuer: 'USDT Gateway', account: 'admin', qr_svg_data_uri: 'data:image/svg+xml;base64,PHN2Zy8+' }})
  api.getConfig.mockResolvedValue({ code: 200, data: { items: configItems() }})
  api.saveConfig.mockResolvedValue({ code: 200, data: { items: configItems() }})
})
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()) })

describe('account authenticator integration', () => {
  it('preserves a bound legacy authenticator without offering to overwrite it', async() => {
    api.status.mockResolvedValue({ code: 200, data: { username: 'existing-admin', scope: 'legacy', totp_enabled: true, totp_secret_saved: true }})
    const wrapper = await render(Security)
    expect(wrapper.text()).toContain('existing-admin')
    expect(wrapper.text()).toContain('无需重新扫码')
    expect(wrapper.findAll('button').some(button => button.text() === '开始绑定')).toBe(false)
    expect(wrapper.find('.unbind-form').exists()).toBe(true)
    expect(api.setup).not.toHaveBeenCalled()
  })

  it('validates six digits, sends the generated secret once, and clears it after binding', async() => {
    const wrapper = await render(Security)
    await wrapper.findAll('button').find(button => button.text() === '开始绑定')!.trigger('click')
    await flushPromises()
    expect(wrapper.find('.totp-secret').text()).toBe('TESTONLYSECRET')
    await wrapper.get('.verification-form input').setValue('12345')
    await wrapper.get('.verification-form').trigger('submit')
    await flushPromises()
    expect(api.bind).not.toHaveBeenCalled()
    let complete!: (value: unknown) => void
    api.bind.mockReturnValue(new Promise(resolve => { complete = resolve }))
    await wrapper.get('.verification-form input').setValue('012345')
    await wrapper.get('.verification-form').trigger('submit')
    await wrapper.get('.verification-form').trigger('submit')
    await flushPromises()
    expect(api.bind).toHaveBeenCalledTimes(1)
    expect(api.bind).toHaveBeenCalledWith('TESTONLYSECRET', '012345')
    api.status.mockResolvedValue({ code: 200, data: { username: 'admin', scope: 'account', totp_enabled: true, totp_secret_saved: true }})
    complete({ code: 200, data: { totp_enabled: true, totp_secret_saved: true }})
    await flushPromises()
    expect(wrapper.text()).not.toContain('TESTONLYSECRET')
    expect(wrapper.find('.unbind-form').exists()).toBe(true)
  })
})

describe('note system configuration', () => {
  it('loads the existing member mode and saves mode changes without overwriting saved secrets', async() => {
    const wrapper = await render(SystemConfigSettings)
    const selected = wrapper.get('input[type=radio][value=member_reuse]').element as HTMLInputElement
    expect(selected.checked).toBe(true)
    expect(wrapper.findAll('input[type=password]').every(input => (input.element as HTMLInputElement).value === '')).toBe(true)
    await wrapper.get('input[type=radio][value=app_reuse]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.saveConfig).toHaveBeenCalledTimes(1)
    expect(api.saveConfig).toHaveBeenCalledWith([{ key: 'DEFAULT_ADDRESS_ASSIGNMENT_MODE', value: 'app_reuse' }])
  })
})

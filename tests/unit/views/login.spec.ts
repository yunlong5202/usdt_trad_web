import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { createRequire } from 'node:module'
// Use the Node distribution so async-validator's CommonJS default is resolved by Node.
const ElementPlus = createRequire(import.meta.url)('element-plus').default as typeof import('element-plus').default
import Login from '@/views/login/index.vue'

const api = vi.hoisted(() => ({ config: vi.fn(), captcha: vi.fn(), login: vi.fn(), push: vi.fn() }))
vi.mock('@/api/login', () => ({ getAuthConfig: api.config, getCodeImg: api.captcha }))
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ login: api.login }) }))
vi.mock('@/stores/system', () => ({
  useSystemStore: () => ({ info: { sys_app_name: 'USDT Gateway' }, settingDetail: async() => ({}) })
}))
vi.mock('vue-router', () => ({ useRoute: () => ({ query: { redirect: '/usdt/wallets' }}), useRouter: () => ({ push: api.push }) }))

const wrappers: ReturnType<typeof mount>[] = []
const render = async() => {
  const wrapper = mount(Login, { global: { plugins: [ElementPlus], stubs: { LangSelect: true }}})
  wrappers.push(wrapper)
  await flushPromises()
  return wrapper
}
const fillCredentials = async(wrapper: ReturnType<typeof mount>) => {
  await wrapper.get('input[name=username]').setValue('admin')
  await wrapper.get('input[name=password]').setValue('test-password')
  await wrapper.get('input[name=code]').setValue('1234')
  await vi.waitFor(() => expect(api.config).toHaveBeenLastCalledWith('admin'))
  await flushPromises()
}

beforeEach(() => {
  vi.resetAllMocks()
  api.config.mockResolvedValue({ code: 200, data: { totp_enabled: true }})
  api.captcha.mockResolvedValue({ code: 200, id: 'challenge-1', data: 'data:image/png;base64,fixture' })
  api.login.mockResolvedValue(undefined)
  api.push.mockResolvedValue(undefined)
})
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()) })

describe('gateway login', () => {
  it('starts without demo credentials and labels the two challenges separately', async() => {
    const wrapper = await render()
    expect((wrapper.get('input[name=username]').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('input[name=password]').element as HTMLInputElement).value).toBe('')
    expect(wrapper.text()).toContain('图形验证码')
    expect(wrapper.text()).toContain('谷歌验证码')
    expect(wrapper.find('.term').exists()).toBe(false)
  })

  it('blocks submission until authentication requirements load', async() => {
    api.config.mockReturnValue(new Promise(() => {}))
    const wrapper = await render()
    await fillCredentials(wrapper)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('.submit-btn').attributes('disabled')).toBeDefined()
    expect(api.login).not.toHaveBeenCalled()
  })

  it('keeps configuration failure visible and allows a safe retry', async() => {
    api.config.mockRejectedValueOnce(new Error('unavailable'))
    const wrapper = await render()
    expect(wrapper.get('.auth-error').text()).toContain('重新加载')
    expect(wrapper.get('.submit-btn').attributes('disabled')).toBeDefined()
    await wrapper.get('.auth-error button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.auth-error').exists()).toBe(false)
    expect(wrapper.find('input[name=totp_code]').exists()).toBe(true)
    expect(wrapper.get('.submit-btn').attributes('disabled')).toBeUndefined()
  })

  it('rejects malformed requirements instead of interpreting them as TOTP disabled', async() => {
    api.config.mockResolvedValue({ code: 200, data: {}})
    const wrapper = await render()
    expect(wrapper.find('.auth-error').exists()).toBe(true)
    expect(wrapper.get('.submit-btn').attributes('disabled')).toBeDefined()
  })

  it('requires a six-digit TOTP before sending the credentials', async() => {
    const wrapper = await render()
    await fillCredentials(wrapper)
    await wrapper.get('input[name=totp_code]').setValue('12345')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.login).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(wrapper.text()).toContain('请输入 6 位数字的谷歌验证码'))
    await wrapper.get('input[name=totp_code]').setValue('012345')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.login).toHaveBeenCalledWith({ username: 'admin', password: 'test-password', code: '1234', uuid: 'challenge-1', totp_code: '012345' })
    expect(api.push).toHaveBeenCalledWith({ path: '/usdt/wallets', query: {}})
  })

  it('does not send a stale code when TOTP is explicitly disabled', async() => {
    api.config.mockResolvedValue({ code: 200, data: { totp_enabled: false }})
    const wrapper = await render()
    expect(wrapper.find('input[name=totp_code]').exists()).toBe(false)
    await fillCredentials(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.login).toHaveBeenCalledWith({ username: 'admin', password: 'test-password', code: '1234', uuid: 'challenge-1' })
  })

  it('clears spent challenges and reloads requirements after a rejected attempt', async() => {
    api.login.mockRejectedValueOnce(new Error('invalid code'))
    const wrapper = await render()
    await fillCredentials(wrapper)
    await wrapper.get('input[name=totp_code]').setValue('012345')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.captcha).toHaveBeenCalledTimes(2)
    expect(api.config).toHaveBeenCalledTimes(3)
    expect((wrapper.get('input[name=code]').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('input[name=totp_code]').element as HTMLInputElement).value).toBe('')
    expect(api.push).not.toHaveBeenCalled()
  })

  it('ignores an old account response after the username changes', async() => {
    let resolveOld!: (value: unknown) => void
    api.config.mockImplementation((username: string) => username === 'alice'
      ? new Promise(resolve => { resolveOld = resolve })
      : Promise.resolve({ code: 200, data: { totp_enabled: true }}))
    const wrapper = await render()
    await wrapper.get('input[name=username]').setValue('alice')
    await vi.waitFor(() => expect(api.config).toHaveBeenLastCalledWith('alice'))
    await wrapper.get('input[name=username]').setValue('bob')
    expect(wrapper.get('.submit-btn').attributes('disabled')).toBeDefined()
    await vi.waitFor(() => expect(api.config).toHaveBeenLastCalledWith('bob'))
    await flushPromises()
    await wrapper.get('input[name=totp_code]').setValue('012345')
    resolveOld({ code: 200, data: { totp_enabled: false }})
    await flushPromises()
    expect((wrapper.get('input[name=totp_code]').element as HTMLInputElement).value).toBe('012345')
    expect(wrapper.get('.submit-btn').attributes('disabled')).toBeUndefined()
  })

  it('sends only one request when the form is submitted twice', async() => {
    let completeLogin!: () => void
    api.login.mockImplementation(() => new Promise<void>(resolve => { completeLogin = resolve }))
    const wrapper = await render()
    await fillCredentials(wrapper)
    await wrapper.get('input[name=totp_code]').setValue('012345')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(api.login).toHaveBeenCalledTimes(1)
    completeLogin()
    await flushPromises()
  })
})


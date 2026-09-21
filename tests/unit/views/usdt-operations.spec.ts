/* eslint-disable vue/one-component-per-file -- Isolated UI library test doubles share this fixture. */
import { createRequire } from 'node:module'
import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { ElMessageBox } from 'element-plus'
import GatewayPage from '@/views/usdt/GatewayPage.vue'
import { resources } from '@/views/usdt/schema'

const ElementPlus = createRequire(import.meta.url)('element-plus').default as typeof import('element-plus').default
const api = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('@/api/usdt', () => ({ gatewayRequest: api.request }))
const tableStub = defineComponent({ props: { table: { type: Object, required: true }}, template: '<div><slot name="toolbar" /><slot v-if="table.rows[0]" name="actions" :row="table.rows[0]" /></div>' })
const selectStub = defineComponent({ name: 'ElSelect', props: { modelValue: { type: String, default: '' }, disabled: Boolean }, emits: ['update:modelValue'], template: '<select :value="modelValue" :disabled="disabled" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>' })
const optionStub = defineComponent({ name: 'ElOption', props: { value: { type: String, default: '' }, label: { type: String, default: '' }}, template: '<option :value="value">{{ label }}</option>' })
const dropdownStub = defineComponent({ name: 'ElDropdown', emits: ['command'], template: '<div><slot /><slot name="dropdown" /></div>' })
const wrappers: ReturnType<typeof mount>[] = []
const render = async(resource: string) => {
  const wrapper = mount(GatewayPage, { props: { resource }, global: { plugins: [ElementPlus], directives: { permisaction: {}}, stubs: { ProTable: tableStub, GasCandidatePicker: true, ElSelect: selectStub, ElOption: optionStub, ElDropdown: dropdownStub, ElDropdownMenu: { template: '<div><slot /></div>' }, ElDropdownItem: { template: '<span><slot /></span>' }, teleport: true }}})
  wrappers.push(wrapper)
  await flushPromises()
  return wrapper
}
const button = (wrapper: ReturnType<typeof mount>, text: string) => wrapper.findAll('button').find(item => item.text() === text)!
beforeEach(() => { vi.resetAllMocks(); vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm' as Awaited<ReturnType<typeof ElMessageBox.confirm>>) })
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()); vi.restoreAllMocks() })

describe('note business operation payloads', () => {
  it('preserves existing event mentions while editing one notification event', async() => {
    api.request.mockImplementation(async(url: string, method = 'GET') => ({ code: 200, data: url === '/notification-settings' && method === 'GET' ? { telegram_enabled: true, telegram_mentions: { deposit_callback_failed: '@existing', test_notice: '@test' }} : { events: [] }}))
    const wrapper = await render('notifications')
    await button(wrapper, '通知配置').trigger('click')
    await flushPromises()
    const mentions = wrapper.findAll('.mention-fields input')
    expect(mentions).toHaveLength(8)
    await mentions[0].setValue('@orders')
    await button(wrapper, '确认执行').trigger('click')
    await flushPromises()
    expect(api.request).toHaveBeenCalledWith('/notification-settings', 'POST', expect.objectContaining({ telegram_mentions: { deposit_callback_failed: '@existing', test_notice: '@test', deposit_created: '@orders' }}))
  })

  it('collects only eligible selected addresses and sends the loaded destination and TOTP', async() => {
    api.request.mockImplementation(async(url: string, method = 'GET') => ({ code: 200, data: url === '/collection-candidates' ? { candidates: [{ address: 'eligible', can_collect: true }, { address: 'blocked', can_collect: false }] } : url === '/collection-settings' && method === 'GET' ? { network: 'BEP20', asset: 'USDT', settlement_wallet: 'destination' } : {}}))
    const wrapper = await render('collection')
    await wrapper.get('input[type=checkbox]').setValue(true)
    await button(wrapper, '归集选中地址').trigger('click')
    await flushPromises()
    const items = wrapper.findAll('.gateway-form > .el-form-item')
    const target = items.find(item => item.text().includes('归集收款地址'))!
    expect((target.get('input').element as HTMLInputElement).value).toBe('destination')
    await items.find(item => item.text().includes('Google 验证码'))!.get('input').setValue('012345')
    await button(wrapper, '确认执行').trigger('click')
    await flushPromises()
    expect(api.request).toHaveBeenCalledWith('/collection/run', 'POST', expect.objectContaining({ network: 'BEP20', addresses: ['eligible'], settlement_wallet: 'destination', verify_code: '012345' }))
    expect(ElMessageBox.confirm).toHaveBeenCalledWith(expect.stringContaining('destination'), expect.any(String), expect.any(Object))
  })

  it('defaults TRON distribution execution to private-key signing', async() => {
    const distribution = { id: 'gas-tron', network: 'TRC20', gas_asset: 'TRX', recipient_count: 2, total_amount: '2', payable_total_amount: '2.1' }
    api.request.mockImplementation(async(url: string) => ({ code: 200, data: url === '/gas-distributions' ? { distributions: [distribution] } : distribution }))
    const wrapper = await render('gas')
    wrapper.getComponent({ name: 'ElDropdown' }).vm.$emit('command', resources.gas.operations.find(operation => operation.key === 'executeGas'))
    await flushPromises()
    expect(wrapper.text()).toContain('TRC20 分发使用私钥签名')
    const method = wrapper.findAll('.gateway-form > .el-form-item').find(item => item.text().includes('签名方式'))!
    expect(method.getComponent({ name: 'ElSelect' }).props('modelValue')).toBe('private_key')
    expect(method.findAllComponents(optionStub).map((option: { props: (key: string) => unknown }) => option.props('value'))).toEqual(['private_key'])
    await button(wrapper, '确认执行').trigger('click')
    await flushPromises()
    expect(api.request.mock.calls.some(([url]) => String(url).endsWith('/execute'))).toBe(false)
  })
})

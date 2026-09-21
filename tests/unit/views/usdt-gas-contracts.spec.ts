import { createRequire } from 'node:module'
import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import GasContractSettings from '@/views/usdt/GasContractSettings.vue'
import type { BatchContractSettings, RuntimeSettings } from '@/api/usdt-settings'

const ElementPlus = createRequire(import.meta.url)('element-plus').default as typeof import('element-plus').default
const api = vi.hoisted(() => ({ getBatch: vi.fn(), saveBatch: vi.fn(), getRuntime: vi.fn(), saveRuntime: vi.fn() }))
const user = vi.hoisted(() => ({ permisaction: ['*:*:*'] }))
vi.mock('@/stores/user', () => ({ useUserStore: () => user }))
vi.mock('@/api/usdt-settings', () => ({ getBatchContractSettings: api.getBatch, updateBatchContractSettings: api.saveBatch, getRuntimeSettings: api.getRuntime, updateRuntimeSettings: api.saveRuntime }))

const bscAddress = `0x${'1'.repeat(40)}`
const nextBscAddress = `0x${'2'.repeat(40)}`
const tronAddress = `T${'A'.repeat(33)}`
const nextTronAddress = `T${'B'.repeat(33)}`
const batch: BatchContractSettings = { enabled: true, contract_address: bscAddress, fee_per_address_wei: '75000000000000', fee_collector: `0x${'3'.repeat(40)}`, max_batch_size: 200, supports_native: true, source_url: 'https://example.com/contract', note: 'existing settings' }
const runtime: RuntimeSettings = { admin_ui_whitelist_ips: '192.0.2.1', order_whitelist_ips: '198.51.100.0/24', default_deposit_expire_minutes: 45, deposit_underpay_tolerance_rate: '0.003', worker_scan_interval_seconds: 12, bsc_scan_lookback_blocks: 6000, trc_batch_gas_contract_address: tronAddress, tron_grpc_endpoint: 'tron.example.com:50051' }
const wrappers: ReturnType<typeof mount>[] = []
const render = async() => {
  const wrapper = mount(GasContractSettings, { global: { plugins: [ElementPlus] }})
  wrappers.push(wrapper)
  await flushPromises()
  return wrapper
}
const button = (wrapper: ReturnType<typeof mount>, text: string) => wrapper.findAll('button').find(item => item.text() === text)!
beforeEach(() => {
  vi.resetAllMocks()
  user.permisaction = ['*:*:*']
  api.getBatch.mockResolvedValue({ code: 200, data: { ...batch }})
  api.getRuntime.mockResolvedValue({ code: 200, data: { ...runtime }})
  api.saveBatch.mockImplementation(async(data: BatchContractSettings) => ({ code: 200, data }))
  api.saveRuntime.mockImplementation(async(data: RuntimeSettings) => ({ code: 200, data }))
})
afterEach(() => { wrappers.splice(0).forEach(wrapper => wrapper.unmount()) })

describe('gas distribution contract settings', () => {
  it('shows both saved contracts without changing either and reports empty addresses explicitly', async() => {
    const wrapper = await render()
    expect(wrapper.get('[data-chain=BEP20]').text()).toContain(bscAddress)
    expect(wrapper.get('[data-chain=TRC20]').text()).toContain(tronAddress)
    expect(wrapper.findAll('.el-tag').every(tag => tag.text() === '已配置')).toBe(true)
    expect(api.saveBatch).not.toHaveBeenCalled()
    expect(api.saveRuntime).not.toHaveBeenCalled()
    api.getBatch.mockResolvedValue({ code: 200, data: { ...batch, contract_address: '' }})
    await wrapper.get('[data-chain=BEP20] button').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-chain=BEP20] .el-tag').text()).toBe('未配置')
    expect(wrapper.get('[data-chain=BEP20] .gas-contract-address').text()).toBe('未配置')
  })

  it('does not request settings for an operator without settings permission', async() => {
    user.permisaction = ['usdt:gas:write']
    const wrapper = await render()
    expect(wrapper.text()).toContain('需要业务设置权限')
    expect(api.getBatch).not.toHaveBeenCalled()
    expect(api.getRuntime).not.toHaveBeenCalled()
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('saves the BSC address with freshly read metadata and never changes TRON settings', async() => {
    const wrapper = await render()
    await button(wrapper, '编辑 BSC (BEP20) 合约').trigger('click')
    await wrapper.get('[data-chain=BEP20] input').setValue(nextBscAddress)
    const latest = { ...batch, enabled: false, max_batch_size: 80, note: 'changed by another admin' }
    api.getBatch.mockResolvedValue({ code: 200, data: latest })
    await wrapper.get('[data-chain=BEP20] form').trigger('submit')
    await flushPromises()
    expect(api.saveBatch).toHaveBeenCalledExactlyOnceWith({ ...latest, contract_address: nextBscAddress })
    expect(api.saveRuntime).not.toHaveBeenCalled()
    expect(wrapper.get('[data-chain=BEP20] [role=status]').text()).toBe('BSC (BEP20) 合约地址已保存')
    expect(wrapper.get('[data-chain=TRC20]').text()).toContain(tronAddress)
  })

  it('keeps a failed BSC edit visible while independently saving TRON without overwriting current runtime fields', async() => {
    const wrapper = await render()
    api.saveBatch.mockRejectedValue(new Error('BSC configuration rejected'))
    await button(wrapper, '编辑 BSC (BEP20) 合约').trigger('click')
    await wrapper.get('[data-chain=BEP20] input').setValue(nextBscAddress)
    await wrapper.get('[data-chain=BEP20] form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[data-chain=BEP20]').text()).toContain('BSC configuration rejected')
    expect(wrapper.get('[data-chain=BEP20] .gas-contract-address').text()).toBe(bscAddress)
    expect(wrapper.find('[data-chain=BEP20] [role=status]').exists()).toBe(false)

    await button(wrapper, '编辑 TRON (TRC20) 合约').trigger('click')
    await wrapper.get('[data-chain=TRC20] input').setValue('invalid address')
    await wrapper.get('[data-chain=TRC20] form').trigger('submit')
    await flushPromises()
    expect(api.saveRuntime).not.toHaveBeenCalled()
    await wrapper.get('[data-chain=TRC20] input').setValue(nextTronAddress)
    const latest = { ...runtime, admin_ui_whitelist_ips: '203.0.113.5', worker_scan_interval_seconds: 30 }
    api.getRuntime.mockResolvedValue({ code: 200, data: latest })
    let finish!: (value: unknown) => void
    api.saveRuntime.mockReturnValue(new Promise(resolve => { finish = resolve }))
    await wrapper.get('[data-chain=TRC20] form').trigger('submit')
    await flushPromises()
    await wrapper.get('[data-chain=TRC20] form').trigger('submit')
    expect(api.saveRuntime).toHaveBeenCalledExactlyOnceWith({ ...latest, trc_batch_gas_contract_address: nextTronAddress })
    expect(wrapper.find('[data-chain=TRC20] [role=status]').exists()).toBe(false)
    finish({ code: 200, data: { ...latest, trc_batch_gas_contract_address: nextTronAddress }})
    await flushPromises()
    expect(wrapper.get('[data-chain=TRC20] [role=status]').text()).toBe('TRON (TRC20) 合约地址已保存')
    expect(wrapper.get('[data-chain=BEP20]').text()).toContain('BSC configuration rejected')
  })
})

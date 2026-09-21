import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface RuntimeSettings {
  admin_ui_whitelist_ips: string
  order_whitelist_ips: string
  default_deposit_expire_minutes: number
  deposit_underpay_tolerance_rate: string
  worker_scan_interval_seconds: number
  bsc_scan_lookback_blocks: number
  trc_batch_gas_contract_address: string
  tron_grpc_endpoint: string
}

export interface TotpStatus {
  username?: string
  scope?: 'account' | 'legacy'
  totp_enabled: boolean
  totp_secret_saved: boolean
  totp_bound_at?: string
}

export interface TotpSetup {
  secret: string
  issuer: string
  account: string
  qr_svg_data_uri: string
}

const base = '/api/v1/usdt'

export function getRuntimeSettings() {
  return request<ApiResponse<RuntimeSettings>>({ url: `${base}/runtime-settings`, method: 'GET' })
}

export function updateRuntimeSettings(data: RuntimeSettings) {
  return request<ApiResponse<RuntimeSettings>>({ url: `${base}/runtime-settings`, method: 'POST', data })
}

export function getTotpStatus() {
  return request<ApiResponse<TotpStatus>>({ url: `${base}/security/totp`, method: 'GET' })
}

export function setupTotp() {
  return request<ApiResponse<TotpSetup>>({ url: `${base}/security/totp/setup`, method: 'POST', data: {}})
}

export function bindTotp(secret: string, code: string) {
  return request<ApiResponse<TotpStatus>>({ url: `${base}/security/totp/bind`, method: 'POST', data: { secret, code }})
}

export function unbindTotp(code: string) {
  return request<ApiResponse<TotpStatus>>({ url: `${base}/security/totp/unbind`, method: 'POST', data: { code }})
}

export interface SystemConfigItem {
  key: string
  value: string
  value_type: string
  description: string
  editable: boolean
  sensitive: boolean
  secret_saved?: boolean
}

export function getSystemConfig() {
  return request<ApiResponse<{ items: SystemConfigItem[] }>>({ url: `${base}/system-config`, method: 'GET' })
}

export function updateSystemConfig(items: { key: string; value: string }[]) {
  return request<ApiResponse<{ items: SystemConfigItem[] }>>({ url: `${base}/system-config`, method: 'POST', data: { items }})
}

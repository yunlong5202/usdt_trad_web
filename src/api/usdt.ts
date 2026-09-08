import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
export type GatewayRow = Record<string, unknown>
export function gatewayRequest(url: string, method: string = 'GET', data: GatewayRow = {}) {
  return request<ApiResponse<GatewayRow>>({ url: '/api/v1/usdt' + url, method, timeout: 180000, ...(method === 'GET' ? { params: data } : { data }) })
}

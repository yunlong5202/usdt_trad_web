import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { AppInfo } from '@/stores/system'

/** Endpoints reachable before a session exists. */

/** Captcha image, as a data URI, plus the id to send back with it. */
export function getCodeImg() {
  return request<ApiResponse<string> & { id: string }>({
    url: '/api/v1/captcha',
    method: 'get'
  })
}

/** Public login requirements; no keys or account details are returned. */
export function getAuthConfig(username: string) {
  return request<ApiResponse<{ totp_enabled: boolean }>>({
    url: '/api/v1/usdt/auth-config',
    method: 'get',
    params: { username }
  })
}

/** Application branding. Deliberately outside the data-permission checks. */
export function getSetting() {
  return request<ApiResponse<AppInfo>>({
    url: '/api/v1/app-config',
    method: 'get'
  })
}

import { API_BASE } from '@/config/env'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

export function request<T>(
  path: string,
  options: {
    method?: HttpMethod
    data?: Record<string, unknown> | object
    query?: Record<string, string | number | undefined | null>
  } = {},
): Promise<T> {
  const method = options.method || 'GET'
  let url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

  if (options.query) {
    const qs = Object.entries(options.query)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    if (qs) url += (url.includes('?') ? '&' : '?') + qs
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data: options.data,
      header: {
        'Content-Type': 'application/json',
      },
      success(res) {
        const status = res.statusCode || 0
        const body = res.data as any
        if (status >= 200 && status < 300) {
          resolve(body as T)
          return
        }
        const msg = body?.message || `请求失败(${status})`
        reject(new ApiError(msg, status))
      },
      fail(err) {
        reject(new ApiError(err.errMsg || `无法连接后端 ${API_BASE}`, 0))
      },
    })
  })
}

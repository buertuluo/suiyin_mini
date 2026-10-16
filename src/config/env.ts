/** 后端地址：可在项目根目录建 .env 设置 VITE_API_BASE */
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  'http://127.0.0.1:3000'

export const DEMO_OPENID = 'demo_openid_suiyin'

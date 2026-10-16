import { DEMO_OPENID } from '@/config/env'
import type { User } from '@/types/ledger'

const SESSION_KEY = 'suiyin_auth_session_v1'

export interface AuthSession {
  token: string
  user: User
  loginAt: string
}

function save(session: AuthSession | null) {
  if (!session) {
    uni.removeStorageSync(SESSION_KEY)
    return
  }
  uni.setStorageSync(SESSION_KEY, session)
}

export function getSession(): AuthSession | null {
  try {
    const raw = uni.getStorageSync(SESSION_KEY)
    if (raw && typeof raw === 'object' && raw.token && raw.user) {
      return raw as AuthSession
    }
  } catch {
    // ignore
  }
  return null
}

export function isLoggedIn(): boolean {
  return !!getSession()?.token
}

export function getCurrentUser(): User | null {
  return getSession()?.user ?? null
}

export function saveSessionUser(user: User, token?: string) {
  const prev = getSession()
  save({
    token: token || prev?.token || `session_${Date.now()}`,
    user,
    loginAt: prev?.loginAt || new Date().toISOString(),
  })
}

/** 微信登录：openid 使用演示值，便于对接后端 seed 用户 */
export function loginWithWeixin(nickname = '碎银用户'): Promise<AuthSession> {
  return new Promise((resolve) => {
    const finish = (token: string) => {
      const session: AuthSession = {
        token,
        user: {
          id: 0,
          openid: DEMO_OPENID,
          nickname: nickname.trim() || '碎银用户',
          avatarUrl: '',
        },
        loginAt: new Date().toISOString(),
      }
      save(session)
      resolve(session)
    }

    uni.login({
      provider: 'weixin',
      success(loginRes) {
        finish(`wx_${loginRes.code || Date.now()}`)
      },
      fail() {
        finish(`dev_${Date.now()}`)
      },
    })
  })
}

export function loginAsGuest(nickname: string): AuthSession {
  const session: AuthSession = {
    token: `guest_${Date.now()}`,
    user: {
      id: 0,
      openid: DEMO_OPENID,
      nickname: nickname.trim() || '碎银用户',
      avatarUrl: '',
    },
    loginAt: new Date().toISOString(),
  }
  save(session)
  return session
}

export function logout() {
  save(null)
}

export function requireLogin(): boolean {
  if (isLoggedIn()) return true
  uni.reLaunch({ url: '/pages/login/index' })
  return false
}

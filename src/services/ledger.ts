import { DEMO_OPENID } from '@/config/env'
import { request } from '@/utils/request'
import type {
  Account,
  Category,
  CreateTransactionInput,
  Ledger,
  Transaction,
  User,
} from '@/types/ledger'
import { toYearMonth } from '@/utils/date'
import { getSession } from '@/services/auth'

interface BootstrapResponse {
  user: User
  ledger: Ledger
  accounts: Account[]
  categories: Category[]
}

interface Cache {
  user: User | null
  ledger: Ledger | null
  accounts: Account[]
  categories: Category[]
}

const cache: Cache = {
  user: null,
  ledger: null,
  accounts: [],
  categories: [],
}

function ensureSessionOpenid() {
  return getSession()?.user?.openid || DEMO_OPENID
}

export async function fetchBootstrap(openid?: string): Promise<BootstrapResponse> {
  const data = await request<BootstrapResponse>('/api/bootstrap', {
    query: { openid: openid || ensureSessionOpenid() },
  })
  cache.user = data.user
  cache.ledger = data.ledger
  cache.accounts = data.accounts
  cache.categories = data.categories
  return data
}

export async function getBootstrap() {
  // 分类为空时强制重新拉取（避免旧缓存一直空）
  if (cache.ledger && cache.accounts.length && cache.categories.length) {
    return {
      user: cache.user!,
      ledger: cache.ledger,
      accounts: cache.accounts,
      categories: cache.categories,
    }
  }
  return fetchBootstrap()
}

export async function listTransactions(yearMonth = toYearMonth()) {
  const boot = await getBootstrap()
  const data = await request<{ list: Transaction[] }>('/api/transactions', {
    query: { ledgerId: boot.ledger.id, yearMonth },
  })
  return data.list
}

export async function getMonthSummary(yearMonth = toYearMonth()) {
  const list = await listTransactions(yearMonth)
  let expense = 0
  let income = 0
  for (const t of list) {
    if (t.type === 'expense') expense += t.amount
    if (t.type === 'income') income += t.amount
  }
  return { expense, income, balance: income - expense, count: list.length }
}

export function getCategoryName(id: number | null): string {
  if (id == null) return '转账'
  return cache.categories.find((c) => c.id === id)?.name ?? '未分类'
}

export function getAccountName(id: number): string {
  return cache.accounts.find((a) => a.id === id)?.name ?? '账户'
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  try {
    return await request<Transaction>(`/api/transactions/${id}`)
  } catch {
    return null
  }
}

export async function getAccountById(id: number): Promise<Account | null> {
  try {
    return await request<Account>(`/api/accounts/${id}`)
  } catch {
    return null
  }
}

export async function listTransactionsByAccount(accountId: number, limit = 50) {
  const data = await request<{ list: Transaction[] }>(
    `/api/accounts/${accountId}/transactions`,
    { query: { limit } },
  )
  return data.list
}

export async function deleteTransaction(id: number) {
  await request(`/api/transactions/${id}`, { method: 'DELETE' })
}

export async function listCategories(type: 'expense' | 'income') {
  const boot = await getBootstrap()
  return boot.categories.filter(
    (c) => c.type === type && (c.parentId == null || c.parentId === undefined),
  )
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const boot = await getBootstrap()
  const userId = getSession()?.user?.id || boot.user.id
  const created = await request<Transaction>('/api/transactions', {
    method: 'POST',
    data: {
      ledgerId: boot.ledger.id,
      userId,
      type: input.type,
      amount: input.amount,
      categoryId: input.type === 'transfer' ? null : input.categoryId,
      accountId: input.accountId,
      toAccountId: input.type === 'transfer' ? input.toAccountId ?? null : null,
      occurredAt: new Date(input.occurredAt.replace(/-/g, '/')).toISOString(),
      note: input.note?.trim() ?? '',
    },
  })
  // 余额变化后刷新账户缓存
  await fetchBootstrap()
  return created
}

export async function createAccount(payload: {
  name: string
  type: string
  icon?: string
}): Promise<Account> {
  const boot = await getBootstrap()
  const created = await request<Account>('/api/accounts', {
    method: 'POST',
    data: {
      ledgerId: boot.ledger.id,
      name: payload.name,
      type: payload.type || 'other',
      icon: payload.icon || payload.type || 'other',
    },
  })
  await fetchBootstrap()
  return created
}

export async function getStatsByCategory(yearMonth = toYearMonth()) {
  await getBootstrap()
  const list = (await listTransactions(yearMonth)).filter((t) => t.type === 'expense')
  const map = new Map<number, number>()
  for (const t of list) {
    if (t.categoryId == null) continue
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount)
  }
  const rows = [...map.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      name: getCategoryName(categoryId),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
  const total = rows.reduce((s, r) => s + r.amount, 0)
  return { total, rows }
}

/** 服务端无重置接口：清空本地缓存并重新拉取 */
export async function resetDemoData() {
  cache.user = null
  cache.ledger = null
  cache.accounts = []
  cache.categories = []
  return fetchBootstrap()
}

export function clearLedgerCache() {
  cache.user = null
  cache.ledger = null
  cache.accounts = []
  cache.categories = []
}

/** 与 MySQL 表结构对齐的前端类型（金额单位：分） */

export type AccountType = string // cash | wechat | alipay | bank | other | 自定义
export type CategoryKind = 'expense' | 'income'
export type TxnType = 'expense' | 'income' | 'transfer'
export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface User {
  id: number
  openid?: string
  nickname: string
  avatarUrl: string
}

export interface Ledger {
  id: number
  name: string
  ownerUserId: number
  currency: string
}

export interface Account {
  id: number
  ledgerId: number
  name: string
  type: AccountType
  icon: string
  balance: number
  sortOrder: number
  isArchived: boolean
}

export interface Category {
  id: number
  ledgerId: number
  parentId: number | null
  name: string
  type: CategoryKind
  icon: string
  sortOrder: number
  isSystem: boolean
}

export interface Transaction {
  id: number
  ledgerId: number
  userId: number
  type: TxnType
  amount: number
  categoryId: number | null
  accountId: number
  toAccountId: number | null
  occurredAt: string // ISO
  note: string
}

export interface Budget {
  id: number
  ledgerId: number
  categoryId: number | null
  yearMonth: string
  amount: number
}

export interface CreateTransactionInput {
  type: TxnType
  amount: number
  categoryId: number | null
  accountId: number
  toAccountId?: number | null
  occurredAt: string
  note?: string
}

import type { Account, Category, Ledger, Transaction, User } from '@/types/ledger'

export const DEMO_USER: User = {
  id: 1,
  openid: 'demo_openid_suiyin',
  nickname: '碎银用户',
  avatarUrl: '',
}

export const DEMO_LEDGER: Ledger = {
  id: 1,
  name: '日常碎银',
  ownerUserId: 1,
  currency: 'CNY',
}

export const DEMO_ACCOUNTS: Account[] = [
  { id: 1, ledgerId: 1, name: '现金', type: 'cash', icon: 'cash', balance: 12800, sortOrder: 10, isArchived: false },
  { id: 2, ledgerId: 1, name: '微信', type: 'wechat', icon: 'wechat', balance: 35650, sortOrder: 20, isArchived: false },
  { id: 3, ledgerId: 1, name: '支付宝', type: 'alipay', icon: 'alipay', balance: 89020, sortOrder: 30, isArchived: false },
  { id: 4, ledgerId: 1, name: '银行卡', type: 'bank', icon: 'bank', balance: 520000, sortOrder: 40, isArchived: false },
]

export const DEMO_CATEGORIES: Category[] = [
  { id: 1, ledgerId: 1, parentId: null, name: '餐饮', type: 'expense', icon: 'food', sortOrder: 10, isSystem: true },
  { id: 2, ledgerId: 1, parentId: null, name: '交通', type: 'expense', icon: 'transport', sortOrder: 20, isSystem: true },
  { id: 3, ledgerId: 1, parentId: null, name: '购物', type: 'expense', icon: 'shopping', sortOrder: 30, isSystem: true },
  { id: 4, ledgerId: 1, parentId: null, name: '住房', type: 'expense', icon: 'home', sortOrder: 40, isSystem: true },
  { id: 5, ledgerId: 1, parentId: null, name: '娱乐', type: 'expense', icon: 'fun', sortOrder: 50, isSystem: true },
  { id: 6, ledgerId: 1, parentId: null, name: '医疗', type: 'expense', icon: 'medical', sortOrder: 60, isSystem: true },
  { id: 7, ledgerId: 1, parentId: null, name: '日用', type: 'expense', icon: 'daily', sortOrder: 90, isSystem: true },
  { id: 8, ledgerId: 1, parentId: null, name: '其他支出', type: 'expense', icon: 'other', sortOrder: 110, isSystem: true },
  { id: 101, ledgerId: 1, parentId: null, name: '工资', type: 'income', icon: 'salary', sortOrder: 10, isSystem: true },
  { id: 102, ledgerId: 1, parentId: null, name: '兼职', type: 'income', icon: 'parttime', sortOrder: 20, isSystem: true },
  { id: 103, ledgerId: 1, parentId: null, name: '红包', type: 'income', icon: 'redpacket', sortOrder: 30, isSystem: true },
  { id: 104, ledgerId: 1, parentId: null, name: '理财', type: 'income', icon: 'invest', sortOrder: 40, isSystem: true },
  { id: 105, ledgerId: 1, parentId: null, name: '其他收入', type: 'income', icon: 'other', sortOrder: 60, isSystem: true },
]

function daysAgo(n: number, hour = 12, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 1, ledgerId: 1, userId: 1, type: 'expense', amount: 3200, categoryId: 1, accountId: 2, toAccountId: null, occurredAt: daysAgo(0, 12, 30), note: '午餐' },
  { id: 2, ledgerId: 1, userId: 1, type: 'expense', amount: 1500, categoryId: 2, accountId: 2, toAccountId: null, occurredAt: daysAgo(0, 9, 10), note: '地铁' },
  { id: 3, ledgerId: 1, userId: 1, type: 'expense', amount: 8900, categoryId: 3, accountId: 3, toAccountId: null, occurredAt: daysAgo(1, 20, 15), note: '' },
  { id: 4, ledgerId: 1, userId: 1, type: 'income', amount: 1200000, categoryId: 101, accountId: 4, toAccountId: null, occurredAt: daysAgo(3, 10, 0), note: '十月工资' },
  { id: 5, ledgerId: 1, userId: 1, type: 'transfer', amount: 50000, categoryId: null, accountId: 4, toAccountId: 2, occurredAt: daysAgo(2, 18, 0), note: '转入微信' },
]

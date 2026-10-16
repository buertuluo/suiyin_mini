<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireLogin } from '@/services/auth'
import {
  getAccountById,
  getAccountName,
  getBootstrap,
  getCategoryName,
  listTransactionsByAccount,
} from '@/services/ledger'
import type { Account, Transaction } from '@/types/ledger'
import { formatDisplayDate } from '@/utils/date'
import { fenToYuan, formatYuan } from '@/utils/money'

const id = ref(0)
const account = ref<Account | null>(null)
const list = ref<Transaction[]>([])

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    cash: '现金',
    wechat: '微信',
    alipay: '支付宝',
    bank: '银行卡',
    other: '自定义',
  }
  return map[account.value?.type || ''] || account.value?.type || ''
})

function amountText(t: Transaction) {
  if (t.type === 'income') return formatYuan(t.amount, true)
  if (t.type === 'expense') return `-${fenToYuan(t.amount)}`
  return fenToYuan(t.amount)
}

function titleOf(t: Transaction) {
  if (t.type === 'transfer') {
    return `${getAccountName(t.accountId)} → ${getAccountName(t.toAccountId!)}`
  }
  return getCategoryName(t.categoryId)
}

async function loadDetail() {
  if (!id.value) return
  try {
    await getBootstrap()
    account.value = await getAccountById(id.value)
    if (!account.value) {
      uni.showToast({ title: '账户不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 400)
      return
    }
    list.value = await listTransactionsByAccount(id.value)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '加载失败',
      icon: 'none',
    })
  }
}

function goTxn(txnId: number) {
  uni.navigateTo({ url: `/pages/transaction/detail?id=${txnId}` })
}

function goRecord() {
  uni.navigateTo({ url: '/pages/record/index' })
}

onLoad((query) => {
  id.value = Number(query?.id || 0)
})

onShow(() => {
  if (!requireLogin()) return
  void loadDetail()
})
</script>

<template>
  <view v-if="account" class="page">
    <view class="hero">
      <view class="badge">{{ account.name.slice(0, 1) }}</view>
      <text class="name">{{ account.name }}</text>
      <text class="type">{{ typeLabel }} · {{ account.type }}</text>
      <text class="balance-label">当前余额</text>
      <text class="balance">¥ {{ fenToYuan(account.balance) }}</text>
    </view>

    <view class="section-head">
      <text class="section-title">相关流水</text>
      <text class="section-action" @click="goRecord">记一笔 ›</text>
    </view>

    <view v-if="!list.length" class="empty">这个账户还没有流水哦</view>
    <view v-else class="list">
      <view
        v-for="t in list"
        :key="t.id"
        class="item"
        @click="goTxn(t.id)"
      >
        <view class="left">
          <text class="title">{{ titleOf(t) }}</text>
          <text class="sub">{{ formatDisplayDate(t.occurredAt) }}</text>
        </view>
        <text class="amount" :class="t.type">{{ amountText(t) }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 28rpx 28rpx 80rpx;
  background: linear-gradient(180deg, #ffe8e4 0%, #fff7f4 100%);
  box-sizing: border-box;
}

.hero {
  padding: 40rpx 32rpx;
  border-radius: 32rpx;
  background: #fff4c8;
  border: 4rpx solid #4e2135;
  box-shadow: 0 10rpx 0 #4e2135;
  text-align: center;
}

.badge {
  width: 88rpx;
  height: 88rpx;
  margin: 0 auto;
  border-radius: 28rpx;
  background: #ffe8e4;
  border: 3rpx solid #4e2135;
  color: #f0716a;
  font-size: 36rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.name {
  display: block;
  margin-top: 20rpx;
  font-size: 40rpx;
  font-weight: 800;
  color: #4e2135;
}

.type {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #b08a96;
}

.balance-label {
  display: block;
  margin-top: 28rpx;
  font-size: 24rpx;
  letter-spacing: 4rpx;
  color: #c7a63a;
}

.balance {
  display: block;
  margin-top: 8rpx;
  font-size: 56rpx;
  font-weight: 700;
  color: #4e2135;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
}

.section-head {
  margin-top: 36rpx;
  margin-bottom: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #4e2135;
}

.section-action {
  font-size: 24rpx;
  font-weight: 700;
  color: #f0716a;
}

.list {
  border-radius: 32rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
  overflow: hidden;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 2rpx dashed rgba(78, 33, 53, 0.08);
}

.item:last-child {
  border-bottom: none;
}

.title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #4e2135;
}

.sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #b08a96;
}

.amount {
  font-size: 32rpx;
  font-weight: 800;
  color: #4e2135;
}

.amount.expense {
  color: #e85d5d;
}

.amount.income {
  color: #3d9b7a;
}

.amount.transfer {
  color: #c7a63a;
}

.empty {
  padding: 48rpx;
  text-align: center;
  color: #b08a96;
  font-size: 26rpx;
  border-radius: 28rpx;
  background: #fff;
  border: 3rpx dashed rgba(78, 33, 53, 0.2);
}
</style>

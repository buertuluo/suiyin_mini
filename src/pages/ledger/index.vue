<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireLogin } from '@/services/auth'
import {
  getAccountName,
  getBootstrap,
  getCategoryName,
  getMonthSummary,
  listTransactions,
} from '@/services/ledger'
import type { Transaction } from '@/types/ledger'
import { formatDisplayDate, shiftMonth, toYearMonth } from '@/utils/date'
import { fenToYuan, formatYuan } from '@/utils/money'

const yearMonth = ref(toYearMonth())
const ledgerName = ref('日常碎银')
const summary = ref({ expense: 0, income: 0, balance: 0, count: 0 })
const list = ref<Transaction[]>([])

async function refresh() {
  try {
    const boot = await getBootstrap()
    ledgerName.value = boot.ledger.name
    summary.value = await getMonthSummary(yearMonth.value)
    list.value = await listTransactions(yearMonth.value)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '加载失败',
      icon: 'none',
    })
  }
}

function prevMonth() {
  yearMonth.value = shiftMonth(yearMonth.value, -1)
  void refresh()
}

function nextMonth() {
  yearMonth.value = shiftMonth(yearMonth.value, 1)
  void refresh()
}

function onMonthPick(e: { detail: { value: string } }) {
  const v = e.detail.value || ''
  yearMonth.value = v.length >= 7 ? v.slice(0, 7) : v
  void refresh()
}

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

function subOf(t: Transaction) {
  const parts = [formatDisplayDate(t.occurredAt)]
  if (t.type !== 'transfer') parts.push(getAccountName(t.accountId))
  if (t.note) parts.push(t.note)
  return parts.join(' · ')
}

const empty = computed(() => list.value.length === 0)

function goRecord() {
  uni.navigateTo({ url: '/pages/record/index' })
}

function goDetail(txnId: number) {
  uni.navigateTo({ url: `/pages/transaction/detail?id=${txnId}` })
}

onShow(() => {
  if (!requireLogin()) return
  void refresh()
})
</script>

<template>
  <view class="page">
    <view class="hero">
      <view class="hero-top">
        <view>
          <text class="brand">碎银记账本</text>
          <text class="ledger">{{ ledgerName }}</text>
        </view>
      </view>

      <view class="month-row">
        <text class="month-btn" @click="prevMonth">‹</text>
        <picker mode="date" fields="month" :value="yearMonth" @change="onMonthPick">
          <view class="month">{{ yearMonth }} ▾</view>
        </picker>
        <text class="month-btn" @click="nextMonth">›</text>
      </view>

      <view class="summary">
        <view class="cell">
          <text class="label">支出</text>
          <text class="value expense">{{ fenToYuan(summary.expense) }}</text>
        </view>
        <view class="cell">
          <text class="label">收入</text>
          <text class="value income">{{ fenToYuan(summary.income) }}</text>
        </view>
        <view class="cell gold">
          <text class="label">结余</text>
          <text class="value">{{ fenToYuan(summary.balance) }}</text>
        </view>
      </view>
    </view>

    <view v-if="empty" class="empty" @click="goRecord">
      <view class="empty-card">
        <text class="empty-text">本月还没有流水</text>
        <text class="empty-sub">点这里记一笔吧</text>
      </view>
    </view>
    <view v-else class="list">
      <view v-for="t in list" :key="t.id" class="item" @click="goDetail(t.id)">
        <view class="dot" :class="t.type" />
        <view class="left">
          <text class="title">{{ titleOf(t) }}</text>
          <text class="sub">{{ subOf(t) }}</text>
        </view>
        <text class="amount" :class="t.type">{{ amountText(t) }} ›</text>
      </view>
    </view>

    <view class="fab" @click="goRecord">
      <view class="fab-icon">
        <text class="fab-plus">+</text>
      </view>
      <text class="fab-text">记一笔</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100%;
  /* #ifdef H5 */
  min-height: var(--suiyin-page-h, calc(100vh - 60px));
  min-height: var(--suiyin-page-h, calc(100dvh - 60px));
  /* #endif */
  background: linear-gradient(180deg, #ffe8e4 0%, #fff7f4 38%, #fff7f4 100%);
  padding-bottom: 12vh;
  box-sizing: border-box;
}

.hero {
  padding: 28rpx 32rpx 20rpx;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #4e2135;
}

.ledger {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #b08a96;
}

.month-row {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.month {
  min-width: 200rpx;
  padding: 10rpx 20rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: #4e2135;
  background: #fff;
  border-radius: 999rpx;
  border: 3rpx solid #4e2135;
  box-shadow: 0 4rpx 0 #4e2135;
}

.month-btn {
  width: 56rpx;
  height: 56rpx;
  line-height: 50rpx;
  text-align: center;
  border-radius: 50%;
  background: #fff;
  color: #f0716a;
  font-size: 36rpx;
  border: 3rpx solid #4e2135;
  box-shadow: 0 4rpx 0 #4e2135;
}

.summary {
  margin-top: 24rpx;
  display: flex;
  gap: 14rpx;
}

.cell {
  flex: 1;
  padding: 22rpx 16rpx;
  border-radius: 24rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 6rpx 0 #4e2135;
}

.cell.gold {
  background: #fff4c8;
}

.label {
  display: block;
  font-size: 22rpx;
  color: #b08a96;
}

.value {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 800;
  color: #4e2135;
}

.value.expense {
  color: #e85d5d;
}

.value.income {
  color: #3d9b7a;
}

.list {
  margin: 12rpx 28rpx 0;
  padding: 8rpx 0;
  border-radius: 32rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
}

.item {
  display: flex;
  align-items: center;
  padding: 26rpx 24rpx;
  border-bottom: 2rpx dashed rgba(78, 33, 53, 0.08);
}

.item:last-child {
  border-bottom: none;
}

.dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background: #d4b84a;
  border: 2rpx solid #4e2135;
}

.dot.expense {
  background: #ff8d85;
}

.dot.income {
  background: #7dceb0;
}

.dot.transfer {
  background: #d4b84a;
}

.left {
  flex: 1;
}

.title {
  display: block;
  font-size: 30rpx;
  color: #4e2135;
  font-weight: 700;
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
  margin: 48rpx 28rpx 0;
}

.empty-card {
  padding: 56rpx 32rpx;
  text-align: center;
  border-radius: 28rpx;
  background: #fff;
  border: 3rpx dashed rgba(78, 33, 53, 0.18);
}

.empty-text {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #4e2135;
}

.empty-sub {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #b08a96;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(var(--tab-bar-height, 60px) + env(safe-area-inset-bottom, 0px) + 16px);
  z-index: 20;
  height: 88rpx;
  padding: 0 28rpx 0 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 2rpx solid rgba(240, 113, 106, 0.35);
  box-shadow: 0 8rpx 28rpx rgba(78, 33, 53, 0.12);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.fab:active {
  transform: scale(0.97);
  opacity: 0.92;
}

.fab-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #ff9b93, #f0716a);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-plus {
  font-size: 40rpx;
  line-height: 1;
  font-weight: 600;
  color: #fff;
  margin-top: -2rpx;
}

.fab-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #4e2135;
  letter-spacing: 1rpx;
}
</style>

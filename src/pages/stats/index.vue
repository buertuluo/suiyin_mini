<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireLogin } from '@/services/auth'
import { getMonthSummary, getStatsByCategory } from '@/services/ledger'
import { shiftMonth, toYearMonth } from '@/utils/date'
import { fenToYuan } from '@/utils/money'

const yearMonth = ref(toYearMonth())
const summary = ref({ expense: 0, income: 0, balance: 0, count: 0 })
const rows = ref<{ categoryId: number; name: string; amount: number }[]>([])
const expenseTotal = ref(0)

const maxAmount = computed(() => rows.value[0]?.amount || 1)

async function refresh() {
  try {
    summary.value = await getMonthSummary(yearMonth.value)
    const stats = await getStatsByCategory(yearMonth.value)
    rows.value = stats.rows
    expenseTotal.value = stats.total
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

function barWidth(amount: number) {
  return `${Math.max(10, Math.round((amount / maxAmount.value) * 100))}%`
}

onShow(() => {
  if (!requireLogin()) return
  void refresh()
})
</script>

<template>
  <view class="page">
    <view class="header">
      <view>
        <text class="title">小猫报表</text>
        <text class="sub">看看碎银都去哪啦</text>
      </view>
      <view class="month-row">
        <text class="month-btn" @click="prevMonth">‹</text>
        <picker mode="date" fields="month" :value="yearMonth" @change="onMonthPick">
          <view class="month">{{ yearMonth }} ▾</view>
        </picker>
        <text class="month-btn" @click="nextMonth">›</text>
      </view>
    </view>

    <view class="cards">
      <view class="card">
        <text class="label">支出</text>
        <text class="num expense">{{ fenToYuan(summary.expense) }}</text>
      </view>
      <view class="card">
        <text class="label">收入</text>
        <text class="num income">{{ fenToYuan(summary.income) }}</text>
      </view>
      <view class="card wide">
        <text class="label">结余 · {{ summary.count }} 笔</text>
        <text class="num">{{ fenToYuan(summary.balance) }}</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">支出分类</text>
      <view v-if="!rows.length" class="empty">本月还没花钱，真棒喵~</view>
      <view v-for="row in rows" :key="row.categoryId" class="stat-row">
        <view class="meta">
          <text class="name">{{ row.name }}</text>
          <text class="amt">{{ fenToYuan(row.amount) }}</text>
        </view>
        <view class="bar-track">
          <view class="bar" :style="{ width: barWidth(row.amount) }" />
        </view>
        <text class="pct">
          {{ expenseTotal ? Math.round((row.amount / expenseTotal) * 100) : 0 }}%
        </text>
      </view>
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
  padding: 28rpx 28rpx 8vh;
  box-sizing: border-box;
  background: linear-gradient(180deg, #ffe8e4 0%, #fff7f4 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #4e2135;
}

.sub {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #b08a96;
}

.month-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.month {
  min-width: 180rpx;
  padding: 8rpx 16rpx;
  text-align: center;
  font-size: 26rpx;
  color: #4e2135;
  font-weight: 700;
  background: #fff;
  border-radius: 999rpx;
  border: 3rpx solid #4e2135;
  box-shadow: 0 4rpx 0 #4e2135;
}

.month-btn {
  width: 52rpx;
  height: 52rpx;
  line-height: 46rpx;
  text-align: center;
  border-radius: 50%;
  background: #fff;
  color: #f0716a;
  font-size: 34rpx;
  border: 3rpx solid #4e2135;
  box-shadow: 0 4rpx 0 #4e2135;
}

.cards {
  margin-top: 28rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.card {
  width: calc(50% - 8rpx);
  padding: 28rpx 24rpx;
  border-radius: 28rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
  box-sizing: border-box;
}

.card.wide {
  width: 100%;
  background: #fff4c8;
}

.label {
  display: block;
  font-size: 24rpx;
  color: #b08a96;
}

.num {
  display: block;
  margin-top: 10rpx;
  font-size: 40rpx;
  font-weight: 800;
  color: #4e2135;
}

.num.expense {
  color: #e85d5d;
}

.num.income {
  color: #3d9b7a;
}

.section {
  margin-top: 28rpx;
  padding: 28rpx;
  border-radius: 32rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 800;
  color: #4e2135;
  margin-bottom: 20rpx;
}

.stat-row {
  margin-bottom: 28rpx;
}

.stat-row:last-child {
  margin-bottom: 0;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.name {
  font-size: 28rpx;
  color: #4e2135;
  font-weight: 600;
}

.amt {
  font-size: 28rpx;
  color: #7a4a5c;
  font-weight: 700;
}

.bar-track {
  height: 18rpx;
  border-radius: 999rpx;
  background: #ffe8e4;
  border: 2rpx solid #4e2135;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ffb3b1, #f0716a);
}

.pct {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #b08a96;
  text-align: right;
}

.empty {
  padding: 40rpx 0;
  text-align: center;
  color: #b08a96;
  font-size: 26rpx;
}
</style>

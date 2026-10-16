<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { requireLogin } from '@/services/auth'
import {
  deleteTransaction,
  getAccountName,
  getBootstrap,
  getCategoryName,
  getTransactionById,
} from '@/services/ledger'
import type { Transaction } from '@/types/ledger'
import { formatDisplayDate } from '@/utils/date'
import { fenToYuan, formatYuan } from '@/utils/money'

const id = ref(0)
const txn = ref<Transaction | null>(null)

const typeLabel = computed(() => {
  if (!txn.value) return ''
  return { expense: '支出', income: '收入', transfer: '转账' }[txn.value.type]
})

const title = computed(() => {
  if (!txn.value) return ''
  if (txn.value.type === 'transfer') {
    return `${getAccountName(txn.value.accountId)} → ${getAccountName(txn.value.toAccountId!)}`
  }
  return getCategoryName(txn.value.categoryId)
})

const amountText = computed(() => {
  if (!txn.value) return '0.00'
  if (txn.value.type === 'income') return formatYuan(txn.value.amount, true)
  if (txn.value.type === 'expense') return `-${fenToYuan(txn.value.amount)}`
  return fenToYuan(txn.value.amount)
})

async function loadDetail() {
  if (!id.value) return
  try {
    await getBootstrap()
    txn.value = await getTransactionById(id.value)
    if (!txn.value) {
      uni.showToast({ title: '流水不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 400)
    }
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '加载失败',
      icon: 'none',
    })
  }
}

function onDelete() {
  uni.showModal({
    title: '删除这笔账？',
    content: '删除后账户余额会回滚，确定吗？',
    confirmColor: '#e85d5d',
    async success(res) {
      if (!res.confirm || !txn.value) return
      try {
        await deleteTransaction(txn.value.id)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 350)
      } catch (err) {
        uni.showToast({
          title: err instanceof Error ? err.message : '删除失败',
          icon: 'none',
        })
      }
    },
  })
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
  <view v-if="txn" class="page">
    <view class="hero" :class="txn.type">
      <text class="type-tag">{{ typeLabel }}</text>
      <text class="amount">{{ amountText }}</text>
      <text class="title">{{ title }}</text>
    </view>

    <view class="card">
      <view class="row">
        <text class="label">时间</text>
        <text class="value">{{ formatDisplayDate(txn.occurredAt) }}</text>
      </view>
      <view v-if="txn.type !== 'transfer'" class="row">
        <text class="label">分类</text>
        <text class="value">{{ getCategoryName(txn.categoryId) }}</text>
      </view>
      <view class="row">
        <text class="label">{{ txn.type === 'transfer' ? '转出账户' : '账户' }}</text>
        <text class="value">{{ getAccountName(txn.accountId) }}</text>
      </view>
      <view v-if="txn.type === 'transfer'" class="row">
        <text class="label">转入账户</text>
        <text class="value">{{ getAccountName(txn.toAccountId!) }}</text>
      </view>
      <view class="row">
        <text class="label">备注</text>
        <text class="value">{{ txn.note || '无' }}</text>
      </view>
      <view class="row">
        <text class="label">流水号</text>
        <text class="value mono">#{{ txn.id }}</text>
      </view>
    </view>

    <button class="btn danger" @click="onDelete">删除这笔账</button>
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
  padding: 48rpx 32rpx;
  border-radius: 32rpx;
  background: #fff;
  border: 4rpx solid #4e2135;
  box-shadow: 0 10rpx 0 #4e2135;
  text-align: center;
}

.hero.expense {
  background: #ffe8e4;
}

.hero.income {
  background: #e8f7f1;
}

.hero.transfer {
  background: #fff4c8;
}

.type-tag {
  display: inline-block;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  background: #4e2135;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}

.amount {
  display: block;
  margin-top: 20rpx;
  font-size: 64rpx;
  font-weight: 800;
  color: #4e2135;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
}

.title {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #7a4a5c;
}

.card {
  margin-top: 28rpx;
  border-radius: 32rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
  overflow: hidden;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
  padding: 28rpx;
  border-bottom: 2rpx dashed rgba(78, 33, 53, 0.08);
}

.row:last-child {
  border-bottom: none;
}

.label {
  font-size: 26rpx;
  color: #b08a96;
  flex-shrink: 0;
}

.value {
  font-size: 28rpx;
  color: #4e2135;
  font-weight: 600;
  text-align: right;
}

.mono {
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
}

.btn {
  margin-top: 40rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
}

.btn::after {
  border: none;
}

.btn.danger {
  background: #fff;
  color: #e85d5d;
}
</style>

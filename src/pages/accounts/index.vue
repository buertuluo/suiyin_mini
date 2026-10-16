<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireLogin } from '@/services/auth'
import { createAccount, getBootstrap } from '@/services/ledger'
import type { Account } from '@/types/ledger'
import { fenToYuan } from '@/utils/money'

const ledgerName = ref('')
const accounts = ref<Account[]>([])
const showForm = ref(false)
const newName = ref('')
const newType = ref('other')

const typeOptions = [
  { value: 'cash', label: '现金' },
  { value: 'wechat', label: '微信' },
  { value: 'alipay', label: '支付宝' },
  { value: 'bank', label: '银行卡' },
  { value: 'other', label: '自定义' },
]

const total = computed(() => accounts.value.reduce((s, a) => s + a.balance, 0))
const typeLabels = computed(() => typeOptions.map((t) => t.label))
const typeIndex = computed(() =>
  Math.max(0, typeOptions.findIndex((t) => t.value === newType.value)),
)

async function refresh() {
  try {
    const boot = await getBootstrap()
    ledgerName.value = boot.ledger.name
    accounts.value = boot.accounts
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '加载失败',
      icon: 'none',
    })
  }
}

function onTypePick(e: { detail: { value: string } }) {
  newType.value = typeOptions[Number(e.detail.value)]?.value ?? 'other'
}

function openForm() {
  showForm.value = true
  newName.value = ''
  newType.value = 'other'
}

function goDetail(accountId: number) {
  uni.navigateTo({ url: `/pages/account/detail?id=${accountId}` })
}

async function saveAccount() {
  try {
    await createAccount({ name: newName.value, type: newType.value, icon: newType.value })
    showForm.value = false
    await refresh()
    uni.showToast({ title: '账户加好啦', icon: 'success' })
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '添加失败',
      icon: 'none',
    })
  }
}

onShow(() => {
  if (!requireLogin()) return
  void refresh()
})
</script>

<template>
  <view class="page">
    <view class="summary">
      <text class="label">净资产</text>
      <view class="total-row">
        <text class="currency">¥</text>
        <text class="total">{{ fenToYuan(total) }}</text>
      </view>
      <text class="tip">{{ ledgerName }} · 可添加饭卡、储蓄卡等</text>
    </view>

    <view class="list">
      <view v-for="a in accounts" :key="a.id" class="item" @click="goDetail(a.id)">
        <view class="badge">{{ a.name.slice(0, 1) }}</view>
        <view class="left">
          <text class="name">{{ a.name }}</text>
          <text class="type">{{ a.type }}</text>
        </view>
        <text class="balance">{{ fenToYuan(a.balance) }} ›</text>
      </view>
    </view>

    <button class="btn primary" @click="openForm">添加自定义账户</button>

    <view v-if="showForm" class="mask" @click="showForm = false">
      <view class="sheet" @click.stop>
        <text class="sheet-title">新账户</text>
        <input v-model="newName" class="input" placeholder="账户名称，如饭卡" maxlength="20" />
        <picker mode="selector" :range="typeLabels" :value="typeIndex" @change="onTypePick">
          <view class="picker">类型：{{ typeLabels[typeIndex] }} ›</view>
        </picker>
        <button class="btn primary" @click="saveAccount">保存</button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 28rpx 28rpx 80rpx;
  background: linear-gradient(180deg, #ffe8e4 0%, #fff7f4 100%);
}

.summary {
  padding: 36rpx 32rpx 32rpx;
  border-radius: 32rpx;
  background: #fff4c8;
  border: 4rpx solid #4e2135;
  box-shadow: 0 10rpx 0 #4e2135;
}

.label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  letter-spacing: 6rpx;
  color: #c7a63a;
}

.total-row {
  margin-top: 12rpx;
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.currency {
  font-size: 36rpx;
  font-weight: 600;
  color: #c7a63a;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
}

.total {
  font-size: 64rpx;
  font-weight: 700;
  line-height: 1.1;
  color: #4e2135;
  letter-spacing: 1rpx;
  font-family: 'DIN Alternate', 'Helvetica Neue', Arial, 'PingFang SC', sans-serif;
  font-variant-numeric: tabular-nums;
}

.tip {
  display: block;
  margin-top: 16rpx;
  font-size: 22rpx;
  color: #b08a96;
}

.list {
  margin-top: 28rpx;
  border-radius: 32rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 2rpx dashed rgba(78, 33, 53, 0.08);
}

.item:last-child {
  border-bottom: none;
}

.badge {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: #ffe8e4;
  border: 3rpx solid #4e2135;
  color: #f0716a;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18rpx;
}

.left {
  flex: 1;
}

.name {
  display: block;
  font-size: 30rpx;
  color: #4e2135;
  font-weight: 700;
}

.type {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #b08a96;
}

.balance {
  font-size: 32rpx;
  font-weight: 800;
  color: #4e2135;
}

.btn {
  margin-top: 28rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
}

.btn::after {
  border: none;
}

.btn.primary {
  background: #d4b84a;
  color: #4e2135;
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(78, 33, 53, 0.35);
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  padding: 36rpx 32rpx 48rpx;
  border-radius: 36rpx 36rpx 0 0;
  background: #fff7f4;
  border-top: 4rpx solid #4e2135;
}

.sheet-title {
  display: block;
  font-size: 34rpx;
  font-weight: 800;
  color: #4e2135;
  margin-bottom: 24rpx;
}

.input {
  padding: 24rpx;
  border-radius: 20rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  font-size: 30rpx;
  margin-bottom: 20rpx;
  color: #4e2135;
}

.picker {
  padding: 24rpx 8rpx;
  font-size: 28rpx;
  color: #4e2135;
  font-weight: 600;
  margin-bottom: 12rpx;
}
</style>

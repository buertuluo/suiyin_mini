<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { requireLogin } from '@/services/auth'
import {
  createTransaction,
  getBootstrap,
  listCategories,
} from '@/services/ledger'
import type { Account, Category, TxnType } from '@/types/ledger'
import { formatDateTimeLocal } from '@/utils/date'
import { yuanInputToFen } from '@/utils/money'

const types: { key: TxnType; label: string }[] = [
  { key: 'expense', label: '支出' },
  { key: 'income', label: '收入' },
  { key: 'transfer', label: '转账' },
]

const type = ref<TxnType>('expense')
const amountText = ref('')
const note = ref('')
const occurredAt = ref(formatDateTimeLocal())
const accounts = ref<Account[]>([])
const categories = ref<Category[]>([])
const accountId = ref<number | null>(null)
const toAccountId = ref<number | null>(null)
const categoryId = ref<number | null>(null)
const submitting = ref(false)

const accountNames = computed(() => accounts.value.map((a) => a.name))
const categoryNames = computed(() => categories.value.map((c) => c.name))
const accountIndex = computed(() =>
  Math.max(0, accounts.value.findIndex((a) => a.id === accountId.value)),
)
const toAccountIndex = computed(() =>
  Math.max(0, accounts.value.findIndex((a) => a.id === toAccountId.value)),
)
const categoryIndex = computed(() =>
  Math.max(0, categories.value.findIndex((c) => c.id === categoryId.value)),
)

async function refresh() {
  try {
    const boot = await getBootstrap()
    accounts.value = boot.accounts
    if (!accountId.value && accounts.value[0]) accountId.value = accounts.value[0].id
    if (!toAccountId.value && accounts.value[1]) toAccountId.value = accounts.value[1].id
    await reloadCategories()
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '加载失败',
      icon: 'none',
    })
  }
}

async function reloadCategories() {
  if (type.value === 'transfer') {
    categories.value = []
    categoryId.value = null
    return
  }
  categories.value = await listCategories(type.value)
  if (!categories.value.find((c) => c.id === categoryId.value)) {
    categoryId.value = categories.value[0]?.id ?? null
  }
}

function onTypeChange(key: TxnType) {
  type.value = key
  void reloadCategories()
}

function onAccountPick(e: { detail: { value: string } }) {
  accountId.value = accounts.value[Number(e.detail.value)]?.id ?? null
}

function onToAccountPick(e: { detail: { value: string } }) {
  toAccountId.value = accounts.value[Number(e.detail.value)]?.id ?? null
}

function onCategoryPick(e: { detail: { value: string } }) {
  categoryId.value = categories.value[Number(e.detail.value)]?.id ?? null
}

function onDatePick(e: { detail: { value: string } }) {
  const time = occurredAt.value.slice(11) || '12:00'
  occurredAt.value = `${e.detail.value} ${time}`
}

function onTimePick(e: { detail: { value: string } }) {
  const date = occurredAt.value.slice(0, 10)
  occurredAt.value = `${date} ${e.detail.value}`
}

async function submit() {
  if (submitting.value) return
  const fen = yuanInputToFen(amountText.value)
  if (fen == null || fen <= 0) {
    uni.showToast({ title: '请输入正确金额', icon: 'none' })
    return
  }
  if (!accountId.value) {
    uni.showToast({ title: '请选择账户', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await createTransaction({
      type: type.value,
      amount: fen,
      categoryId: categoryId.value,
      accountId: accountId.value,
      toAccountId: toAccountId.value,
      occurredAt: occurredAt.value,
      note: note.value,
    })
    amountText.value = ''
    note.value = ''
    uni.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack({
        fail: () => uni.switchTab({ url: '/pages/ledger/index' }),
      })
    }, 400)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '记账失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}

onShow(() => {
  if (!requireLogin()) return
  void refresh()
})
</script>

<template>
  <view class="page">
    <view class="type-tabs">
      <text
        v-for="item in types"
        :key="item.key"
        class="tab"
        :class="{ active: type === item.key }"
        @click="onTypeChange(item.key)"
      >
        {{ item.label }}
      </text>
    </view>

    <view class="amount-box">
      <text class="currency">¥</text>
      <input
        v-model="amountText"
        class="amount-input"
        type="digit"
        placeholder="0.00"
        placeholder-class="ph"
      />
      <text class="hint">投币中...</text>
    </view>

    <view class="form">
      <view v-if="type !== 'transfer'" class="row">
        <text class="label">分类</text>
        <picker mode="selector" :range="categoryNames" :value="categoryIndex" @change="onCategoryPick">
          <view class="picker">{{ categoryNames[categoryIndex] || '请选择' }} ›</view>
        </picker>
      </view>

      <view class="row">
        <text class="label">{{ type === 'transfer' ? '转出' : '账户' }}</text>
        <picker mode="selector" :range="accountNames" :value="accountIndex" @change="onAccountPick">
          <view class="picker">{{ accountNames[accountIndex] || '请选择' }} ›</view>
        </picker>
      </view>

      <view v-if="type === 'transfer'" class="row">
        <text class="label">转入</text>
        <picker mode="selector" :range="accountNames" :value="toAccountIndex" @change="onToAccountPick">
          <view class="picker">{{ accountNames[toAccountIndex] || '请选择' }} ›</view>
        </picker>
      </view>

      <view class="row">
        <text class="label">日期</text>
        <picker mode="date" :value="occurredAt.slice(0, 10)" @change="onDatePick">
          <view class="picker">{{ occurredAt.slice(0, 10) }} ›</view>
        </picker>
      </view>

      <view class="row">
        <text class="label">时间</text>
        <picker mode="time" :value="occurredAt.slice(11, 16)" @change="onTimePick">
          <view class="picker">{{ occurredAt.slice(11, 16) }} ›</view>
        </picker>
      </view>

      <view class="row">
        <text class="label">备注</text>
        <input v-model="note" class="note" maxlength="50" placeholder="写点什么吧" />
      </view>
    </view>

    <button class="submit" :loading="submitting" @click="submit">投进存钱罐</button>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx 60rpx;
  background: linear-gradient(180deg, #ffe8e4 0%, #fff7f4 100%);
}

.type-tabs {
  display: flex;
  gap: 12rpx;
  padding: 10rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 6rpx 0 #4e2135;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #b08a96;
}

.tab.active {
  background: #ff8d85;
  color: #fff;
}

.amount-box {
  margin-top: 28rpx;
  padding: 36rpx 28rpx 28rpx;
  border-radius: 32rpx;
  background: #fff4c8;
  border: 4rpx solid #4e2135;
  box-shadow: 0 10rpx 0 #4e2135;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
}

.currency {
  font-size: 48rpx;
  color: #4e2135;
  margin-right: 12rpx;
  font-weight: 800;
}

.amount-input {
  flex: 1;
  font-size: 64rpx;
  font-weight: 800;
  color: #4e2135;
  height: 80rpx;
  min-width: 200rpx;
}

.ph {
  color: #d8bcc4;
}

.hint {
  width: 100%;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #c7a63a;
  font-weight: 600;
}

.form {
  margin-top: 24rpx;
  border-radius: 32rpx;
  background: #fff;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 28rpx;
  border-bottom: 2rpx dashed rgba(78, 33, 53, 0.08);
}

.row:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #7a4a5c;
  width: 120rpx;
  font-weight: 600;
}

.picker {
  font-size: 28rpx;
  color: #4e2135;
  font-weight: 600;
}

.note {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #4e2135;
}

.submit {
  margin-top: 44rpx;
  background: #d4b84a;
  color: #4e2135;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 800;
  border: 4rpx solid #4e2135;
  box-shadow: 0 10rpx 0 #4e2135;
}

.submit::after {
  border: none;
}

.submit:active {
  transform: translateY(4rpx);
  box-shadow: 0 6rpx 0 #4e2135;
}
</style>

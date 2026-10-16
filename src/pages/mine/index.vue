<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCurrentUser, getSession, logout, requireLogin } from '@/services/auth'
import { clearLedgerCache, getBootstrap, resetDemoData } from '@/services/ledger'
import { fenToYuan } from '@/utils/money'

const nickname = ref('')
const ledgerName = ref('')
const totalAssets = ref(0)
const loginAt = ref('')

const assetText = computed(() => fenToYuan(totalAssets.value))

async function refresh() {
  try {
    const boot = await getBootstrap()
    nickname.value = getCurrentUser()?.nickname || boot.user.nickname
    ledgerName.value = boot.ledger.name
    totalAssets.value = boot.accounts.reduce((s, a) => s + a.balance, 0)
    const session = getSession()
    loginAt.value = session?.loginAt
      ? session.loginAt.slice(0, 10)
      : ''
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : '加载失败',
      icon: 'none',
    })
  }
}

function goAccounts() {
  uni.navigateTo({ url: '/pages/accounts/index' })
}

function onReset() {
  uni.showModal({
    title: '重新拉取数据',
    content: '将重新从服务器加载演示账本数据，确定吗？',
    async success(res) {
      if (!res.confirm) return
      try {
        await resetDemoData()
        await refresh()
        uni.showToast({ title: '已刷新', icon: 'success' })
      } catch (err) {
        uni.showToast({
          title: err instanceof Error ? err.message : '刷新失败',
          icon: 'none',
        })
      }
    },
  })
}

function onAbout() {
  uni.showModal({
    title: '关于碎银记账本',
    content: '和小猫一起记账的小本本。当前为本地演示版，后续可对接 MySQL / 微信云开发。',
    showCancel: false,
  })
}

function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定退出当前账号吗？',
    success(res) {
      if (!res.confirm) return
      clearLedgerCache()
      logout()
      uni.reLaunch({ url: '/pages/login/index' })
    },
  })
}

onShow(() => {
  if (!requireLogin()) return
  void refresh()
})
</script>

<template>
  <view class="page">
    <view class="hero">
      <view class="avatar">{{ nickname.slice(0, 1) || '碎' }}</view>
      <view class="info">
        <text class="name">{{ nickname }}</text>
        <text class="ledger">{{ ledgerName }}</text>
        <text v-if="loginAt" class="meta">登录于 {{ loginAt }}</text>
      </view>
    </view>

    <view class="asset" @click="goAccounts">
      <view>
        <text class="asset-label">净资产</text>
        <text class="asset-value">¥ {{ assetText }}</text>
      </view>
      <text class="asset-go">账户管理 ›</text>
    </view>

    <view class="menu">
      <view class="row" @click="goAccounts">
        <text class="row-title">资金账户</text>
        <text class="row-extra">自定义现金 / 微信等 ›</text>
      </view>
      <view class="row" @click="onReset">
        <text class="row-title">重新拉取数据</text>
        <text class="row-extra">›</text>
      </view>
      <view class="row" @click="onAbout">
        <text class="row-title">关于碎银记账本</text>
        <text class="row-extra">›</text>
      </view>
    </view>

    <button class="logout" @click="onLogout">退出登录</button>
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
  background: linear-gradient(180deg, #ffe8e4 0%, #fff7f4 40%, #fff7f4 100%);
}

.hero {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 12rpx 8rpx 8rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 36rpx;
  border: 3rpx solid #4e2135;
  background: #ffe8e4;
  color: #f0716a;
  font-size: 44rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info {
  flex: 1;
}

.name {
  display: block;
  font-size: 40rpx;
  font-weight: 800;
  color: #4e2135;
}

.ledger {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #7a4a5c;
  font-weight: 600;
}

.meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #b08a96;
}

.asset {
  margin-top: 28rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #fff4c8;
  border: 4rpx solid #4e2135;
  box-shadow: 0 10rpx 0 #4e2135;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.asset-label {
  display: block;
  font-size: 24rpx;
  color: #7a4a5c;
}

.asset-value {
  display: block;
  margin-top: 10rpx;
  font-size: 48rpx;
  font-weight: 800;
  color: #4e2135;
}

.asset-go {
  font-size: 24rpx;
  font-weight: 700;
  color: #c7a63a;
  margin-bottom: 8rpx;
}

.menu {
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
  align-items: center;
  padding: 32rpx 28rpx;
  border-bottom: 2rpx dashed rgba(78, 33, 53, 0.08);
}

.row:last-child {
  border-bottom: none;
}

.row-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #4e2135;
}

.row-extra {
  font-size: 24rpx;
  color: #b08a96;
}

.logout {
  margin-top: 40rpx;
  background: #fff;
  color: #f0716a;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  border: 3rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
}

.logout::after {
  border: none;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { API_BASE } from '@/config/env'
import {
  isLoggedIn,
  loginAsGuest,
  loginWithWeixin,
  saveSessionUser,
} from '@/services/auth'
import { clearLedgerCache, fetchBootstrap } from '@/services/ledger'

const nickname = ref('碎银用户')
const loading = ref(false)

function goHome() {
  uni.switchTab({ url: '/pages/ledger/index' })
}

onShow(() => {
  if (isLoggedIn()) goHome()
})

async function afterLogin() {
  clearLedgerCache()
  const boot = await fetchBootstrap()
  saveSessionUser({
    ...boot.user,
    nickname: nickname.value.trim() || boot.user.nickname,
  })
}

async function onWeixinLogin() {
  if (loading.value) return
  loading.value = true
  try {
    await loginWithWeixin(nickname.value)
    await afterLogin()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(goHome, 300)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : `无法连接 ${API_BASE}`,
      icon: 'none',
      duration: 2500,
    })
  } finally {
    loading.value = false
  }
}

async function onGuestLogin() {
  if (loading.value) return
  loading.value = true
  try {
    loginAsGuest(nickname.value)
    await afterLogin()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(goHome, 300)
  } catch (err) {
    uni.showToast({
      title: err instanceof Error ? err.message : `无法连接 ${API_BASE}`,
      icon: 'none',
      duration: 2500,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="page">
    <view class="blob blob-a" />
    <view class="blob blob-b" />

    <view class="content">
      <view class="mascot-wrap">
        <image class="mascot" src="/static/brand/mascot.png" mode="aspectFit" />
        <view class="coin-tag">叮~</view>
      </view>

      <text class="brand">碎银记账本</text>
      <text class="slogan">和小猫一起，把碎银乖乖存好</text>

      <view class="card">
        <text class="label">怎么称呼你呀</text>
        <input
          v-model="nickname"
          class="input"
          maxlength="20"
          placeholder="昵称"
        />
      </view>

      <button class="btn primary" :loading="loading" @click="onWeixinLogin">
        微信一键登录
      </button>
      <button class="btn ghost" :disabled="loading" @click="onGuestLogin">
        先摸摸猫头体验一下
      </button>
      <text class="api-hint">API：{{ API_BASE }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #ff9b93 0%, #ff8d85 42%, #fff7f4 42%, #ffe8e4 100%);
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
}

.blob-a {
  width: 280rpx;
  height: 280rpx;
  right: -60rpx;
  top: 80rpx;
  background: rgba(212, 184, 74, 0.28);
}

.blob-b {
  width: 200rpx;
  height: 200rpx;
  left: -40rpx;
  top: 320rpx;
  background: rgba(255, 255, 255, 0.25);
}

.content {
  position: relative;
  z-index: 1;
  padding: 100rpx 48rpx 80rpx;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
}

.mascot-wrap {
  width: 280rpx;
  height: 280rpx;
  margin: 0 auto 12rpx;
  position: relative;
}

.mascot {
  width: 100%;
  height: 100%;
  border-radius: 60rpx;
  box-shadow: 0 16rpx 40rpx rgba(78, 33, 53, 0.18);
}

.coin-tag {
  position: absolute;
  right: -8rpx;
  top: -8rpx;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #d4b84a;
  color: #4e2135;
  font-size: 22rpx;
  font-weight: 700;
  border: 3rpx solid #4e2135;
}

.brand {
  margin-top: 28rpx;
  text-align: center;
  font-size: 56rpx;
  font-weight: 800;
  color: #4e2135;
  letter-spacing: 4rpx;
}

.slogan {
  margin-top: 12rpx;
  text-align: center;
  font-size: 26rpx;
  color: #7a4a5c;
}

.card {
  margin-top: 56rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: #fff;
  border: 4rpx solid #4e2135;
  box-shadow: 0 10rpx 0 #4e2135;
}

.label {
  display: block;
  font-size: 24rpx;
  color: #b08a96;
  margin-bottom: 12rpx;
}

.input {
  font-size: 34rpx;
  color: #4e2135;
  font-weight: 700;
}

.btn {
  margin-top: 28rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  border: 4rpx solid #4e2135;
  box-shadow: 0 8rpx 0 #4e2135;
}

.btn::after {
  border: none;
}

.btn.primary {
  margin-top: 40rpx;
  background: #d4b84a;
  color: #4e2135;
}

.btn.ghost {
  background: #fff;
  color: #f0716a;
}

.btn:active {
  transform: translateY(4rpx);
  box-shadow: 0 4rpx 0 #4e2135;
}

.api-hint {
  margin-top: 28rpx;
  text-align: center;
  font-size: 20rpx;
  color: #b08a96;
}
</style>

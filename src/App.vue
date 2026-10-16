<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/services/auth'

onLaunch(() => {
  if (isLoggedIn()) {
    uni.switchTab({ url: '/pages/ledger/index' })
  }
})
</script>

<style lang="scss">
@import '@/styles/theme.scss';

page {
  background-color: $cream;
  color: $ink;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* #ifdef H5 */
:root {
  /* 与 pages.json tabBar.height 保持一致 */
  --tab-bar-height: 60px;
  --suiyin-safe-bottom: env(safe-area-inset-bottom, 0px);
  --suiyin-vh: 100vh;
  --suiyin-vh: 100dvh;
  --suiyin-tab-total: calc(var(--tab-bar-height) + var(--suiyin-safe-bottom));
  --suiyin-page-h: calc(var(--suiyin-vh) - var(--suiyin-tab-total));
}

html,
body,
#app {
  width: 100%;
  height: var(--suiyin-vh);
  max-height: var(--suiyin-vh);
  overflow: hidden;
  margin: 0;
}

uni-app {
  display: block;
  width: 100%;
  height: var(--suiyin-vh);
  max-height: var(--suiyin-vh);
  overflow: hidden;
}

/* 有 tab 的页面：内容区高度 = 视口 - tab 栏 */
.uni-app--showtabbar uni-page-wrapper {
  height: var(--suiyin-page-h) !important;
  max-height: var(--suiyin-page-h) !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
}

.uni-app--showtabbar uni-page-wrapper::after {
  display: none !important;
}

.uni-app--showtabbar
  uni-page-head[uni-page-head-type='default']
  ~ uni-page-wrapper {
  height: calc(var(--suiyin-page-h) - 44px - env(safe-area-inset-top, 0px)) !important;
  max-height: calc(var(--suiyin-page-h) - 44px - env(safe-area-inset-top, 0px)) !important;
}

/* tab 栏：高度用 content-box，安全区用 padding，避免文字被挤没 */
.uni-tabbar-bottom,
.uni-tabbar-bottom .uni-tabbar {
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}

.uni-tabbar-bottom .uni-tabbar,
.uni-tabbar {
  height: var(--tab-bar-height) !important;
  padding-bottom: var(--suiyin-safe-bottom) !important;
  box-sizing: content-box !important;
  background: #fff !important;
  box-shadow: 0 -0.5vh 2vh rgba(78, 33, 53, 0.08) !important;
  overflow: visible !important;
}

.uni-tabbar ~ .uni-placeholder {
  height: var(--tab-bar-height) !important;
  margin-bottom: var(--suiyin-safe-bottom) !important;
}

.uni-tabbar__item,
.uni-tabbar__bd {
  height: var(--tab-bar-height) !important;
  overflow: visible !important;
}

.uni-tabbar__icon {
  width: 24px !important;
  height: 24px !important;
  margin-top: 0.8vh !important;
  margin-bottom: 0.2vh !important;
  flex-shrink: 0 !important;
}

.uni-tabbar__label {
  display: block !important;
  font-size: 12px !important;
  line-height: 1.2 !important;
  font-weight: 600 !important;
  color: #b08a96 !important;
  white-space: nowrap !important;
  overflow: visible !important;
}

.uni-tabbar__item--active .uni-tabbar__label {
  color: #f0716a !important;
}
/* #endif */
</style>

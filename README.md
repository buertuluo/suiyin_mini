# 碎银记账本（uni-app）

微信小程序端：`uni-app + Vue3 + TypeScript`。

数据已对接 Java 后端 [`suiyin-api`](../suiyin-api)（金额单位：分）。

1. 先启动后端：`cd ../suiyin-api && .\\mvnw.cmd -s .mvn\\settings.xml spring-boot:run`
2. 配置 API 地址：编辑 `.env.development` 里的 `VITE_API_BASE`（本机 `http://127.0.0.1:3000`，手机调试改成电脑局域网 IP）
3. 再启动小程序 H5：`npm run dev:h5`

## 页面

- 登录：微信一键登录 / 先体验一下（本地会话）
- 流水：月度收支与明细；右下角「记一笔」入口
- 记一笔（二级页）：支出 / 收入 / 转账
- 统计：月度概览与支出分类占比
- 我的：资料、净资产入口、重置数据、关于、退出登录
- 资金账户（二级页）：自定义账户管理
- 流水详情：点首页流水进入，可删除
- 账户详情：点账户进入，看余额与相关流水

## 开发

```bash
cd suiyin-mini
npm install
npm run dev:mp-weixin
```

用微信开发者工具打开目录：

`suiyin-mini/dist/dev/mp-weixin`

（首次需在微信公众平台申请小程序 AppID，可先用测试号；`src/manifest.json` → `mp-weixin.appid`）

H5 预览：

```bash
npm run dev:h5
```

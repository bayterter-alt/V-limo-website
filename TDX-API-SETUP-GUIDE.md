# 🇹🇼 TDX 运输数据平台 API 设置指南

使用台湾交通部官方 API 查询即时航班资讯

---

## 🎯 为什么选择 TDX？

### 优势对比

| 项目 | TDX (台湾交通部) | AviationStack |
|------|------------------|---------------|
| **免费额度** | ✅ **50,000次/天** | ❌ 100次/月 |
| **台湾航班** | ✅ 完整、准确、即时 | ❌ 可能缺漏 |
| **成本** | ✅ **完全免费** | ❌ 付费方案 $49.99/月起 |
| **数据来源** | ✅ 官方数据 | ❌ 第三方聚合 |
| **适用性** | ✅ 完美适合台湾业务 | ❌ 全球数据但台湾覆盖有限 |
| **桃园/松山机场** | ✅ 完整支持 | ⚠️ 有限支持 |

---

## 📋 步骤 1：注册 TDX 账号

### 1.1 访问 TDX 平台

前往：https://tdx.transportdata.tw/

### 1.2 注册会员

1. 点击右上角 **「会员登入/注册」**
2. 选择 **「立即注册」**
3. 填写基本资料：
   - 电子邮件
   - 密码
   - 姓名
   - 用途说明（可填：网站航班查询服务）

### 1.3 验证邮箱

1. 前往您的邮箱
2. 点击验证链接
3. 完成注册

---

## 🔑 步骤 2：取得 API 凭证

### 2.1 登入会员中心

1. 使用刚注册的账号登入
2. 进入 **「会员中心」**

### 2.2 创建应用程式

1. 点击 **「我的应用程式」**
2. 点击 **「新增应用程式」**
3. 填写应用程式资料：
   - **应用程式名称**：`利盟航班查询服务`
   - **应用程式描述**：`提供客户查询航班资讯并预约机场接送`
   - **应用程式类型**：选择 `网页应用程式`
   - **Redirect URI**：填写您的网站网址（如 `https://v-limo.com.tw`）

### 2.3 取得 Client ID 和 Client Secret

创建成功后，您会看到：
- ✅ **Client ID**：类似 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- ✅ **Client Secret**：类似 `yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy`

**⚠️ 重要：请妥善保管这两组凭证！**

---

## 🚀 步骤 3：部署 Cloudflare Worker

### 3.1 登入 Cloudflare Dashboard

前往：https://dash.cloudflare.com/

### 3.2 创建新的 Worker

1. 点击左侧 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Create Worker**
4. Worker 名称：`flight-api-tdx`
5. 点击 **Deploy**

### 3.3 编辑 Worker 代码

1. 部署完成后，点击 **Edit code**
2. 删除所有默认代码
3. 打开本地的 `flight-api-tdx-worker.js` 文件
4. **复制全部内容**
5. 贴到 Cloudflare 编辑器

### 3.4 设置 API 凭证

在 Worker 代码中找到第 14-15 行：

```javascript
const TDX_CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const TDX_CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
```

替换为您的实际凭证：

```javascript
const TDX_CLIENT_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
const TDX_CLIENT_SECRET = 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy';
```

### 3.5 保存并部署

1. 点击右上角 **Save and Deploy**
2. 记下您的 Worker URL，格式如：
   ```
   https://flight-api-tdx.您的用户名.workers.dev
   ```

---

## 🔧 步骤 4：更新网站代码

### 4.1 修改 flight-search.html

打开 `flight-search.html`，找到配置区（约第 835 行）：

**修改前**：
```javascript
const WORKER_API_URL = 'https://flight-api.bayterter.workers.dev';
const USE_REAL_API = false;
```

**修改后**：
```javascript
const WORKER_API_URL = 'https://flight-api-tdx.您的用户名.workers.dev';
const USE_REAL_API = true; // ✅ 启用 TDX API
```

### 4.2 更新 _headers 文件

打开 `_headers`，在 `connect-src` 中添加 TDX 相关网址：

```
connect-src 'self' 
  https://docs.google.com 
  https://cloudflareinsights.com 
  https://static.cloudflareinsights.com 
  https://maps.googleapis.com 
  https://flight-api.bayterter.workers.dev 
  https://flight-api-tdx.您的用户名.workers.dev 
  https://tdx.transportdata.tw 
  https://api.aviationstack.com;
```

### 4.3 提交并部署

```bash
git add flight-search.html _headers
git commit -m "Switch to TDX API for Taiwan flight data"
git push origin main
```

---

## 🧪 步骤 5：测试

### 5.1 等待部署完成

Cloudflare Pages 自动部署（2-3 分钟）

### 5.2 测试查询

访问：`https://v-limo.com.tw/flight-search.html`

尝试查询以下航班（台湾常见航班）：
- **BR189** - 长荣航空（香港 → 桃园）
- **CI835** - 中华航空（洛杉矶 → 桃园）
- **BR856** - 长荣航空（桃园 → 首尔）
- **JX800** - 星宇航空（桃园 → 东京）

### 5.3 验证数据来源

查询成功后，航班号旁边应该显示：
- 🟢 **即时API** 标签（表示使用 TDX 真实数据）

---

## 📊 TDX API 使用限制

### 免费方案限制

| 项目 | 限制 |
|------|------|
| **每日请求次数** | 50,000 次 |
| **每秒请求次数** | 60 次 |
| **数据更新频率** | 即时（约 1-5 分钟） |
| **数据保留期** | 当天 + 未来 3 天 |

### 计算是否足够

假设您的网站：
- 每天 100 位访客
- 每人平均查询 2 次航班
- = 每天 200 次请求

✅ **远低于 50,000 次/天的限制！**

---

## 🔍 支持的机场

| 机场代码 | 机场名称 | 支持状态 |
|----------|----------|----------|
| **TPE** | 台湾桃园国际机场 | ✅ 完整支持 |
| **TSA** | 台北松山机场 | ✅ 完整支持 |
| **RMQ** | 台中清泉岗机场 | ✅ 支持 |
| **KHH** | 高雄小港机场 | ✅ 支持 |

---

## 💡 TDX API 功能

### 可查询的资讯

- ✅ 航班号码
- ✅ 航空公司
- ✅ 起飞/抵达时间（预定、预计、实际）
- ✅ 航厦资讯
- ✅ 登机门
- ✅ 航班状态（预定、起飞、降落、取消、延误）
- ✅ 起飞/抵达机场

### 航班状态即时更新

TDX 数据每 1-5 分钟更新一次，包括：
- 延误资讯
- 登机门变更
- 取消通知
- 实际起降时间

---

## 🆚 与 AviationStack 对比

### 功能对比

| 功能 | TDX | AviationStack 免费版 |
|------|-----|----------------------|
| 桃园机场航班 | ✅ 完整 | ⚠️ 部分 |
| 松山机场航班 | ✅ 完整 | ❌ 很少 |
| 航班状态更新 | ✅ 1-5分钟 | ⚠️ 可能延迟 |
| 历史航班 | ✅ 当天 | ❌ 无 |
| 未来航班 | ✅ 3天内 | ❌ 无 |
| 中文机场名称 | ✅ 原生支持 | ❌ 需翻译 |

### 成本对比（每月）

| 使用量 | TDX | AviationStack |
|--------|-----|---------------|
| 500 次/月 | ✅ $0 | ❌ $0（超额后无法使用） |
| 5,000 次/月 | ✅ $0 | ❌ $49.99 |
| 50,000 次/月 | ✅ $0 | ❌ $149.99 |

---

## ⚠️ 注意事项

### 1. API 凭证安全

- ✅ **正确**：存放在 Cloudflare Worker 中
- ❌ **错误**：直接写在前端代码（会暴露）

### 2. 错误处理

Worker 已包含完整错误处理：
- 401 错误 → 重新取得 Access Token
- 404 错误 → 回退到本地数据库
- 500 错误 → 显示友好错误讯息

### 3. 查询范围

TDX 仅提供台湾机场的航班资讯：
- ✅ 台湾出发的国际/国内航班
- ✅ 抵达台湾的国际/国内航班
- ❌ 不包含纯国外航线（如东京→首尔）

---

## 🎯 建议的使用策略

### 混合模式（最佳）

```javascript
// 优先使用 TDX API
const USE_REAL_API = true;

// 失败时自动回退到本地数据库
// （已在代码中实现）
```

**优势**：
- ✅ 大部分台湾航班查询成功（使用 TDX）
- ✅ 少数特殊航班使用本地数据
- ✅ 用户体验最佳

---

## 📞 技术支援

### TDX 官方资源

- **官方网站**：https://tdx.transportdata.tw/
- **API 文件**：https://tdx.transportdata.tw/api-service/swagger
- **常见问题**：https://tdx.transportdata.tw/faq

### 联系方式

如有技术问题，可透过 TDX 平台的客服系统询问。

---

## ✅ 完成检查清单

- [ ] 注册 TDX 账号
- [ ] 创建应用程式
- [ ] 取得 Client ID 和 Client Secret
- [ ] 部署 Cloudflare Worker
- [ ] 设置 API 凭证
- [ ] 更新网站代码
- [ ] 更新 CSP 设置
- [ ] 提交并部署
- [ ] 测试航班查询
- [ ] 验证数据来源标签

---

**恭喜！完成设置后，您的网站将使用台湾官方航班数据，提供最准确、最即时的航班资讯！** 🎉✈️


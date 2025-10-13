# 🔍 TDX Worker 调试指南

## ❌ 问题诊断

如果您的 TDX Worker 返回 400/429 错误，说明 **Worker 没有正确获取 access_token**。

---

## 📋 症状检查清单

### ✅ 您应该看到的

1. **在 Cloudflare Worker 日志中**：
   - 🔐 `[TDX Auth] Checking credentials...`
   - 📤 `[TDX Auth] Requesting access token...`
   - ✅ `[TDX Auth] Access token obtained successfully`
   - 🔍 `[TDX API] Searching TPE/TSA...`

2. **在浏览器网络请求中**：
   - `POST https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token` (200 OK)
   - `GET https://tdx.transportdata.tw/api/basic/v2/Air/FIDS/Airport/...` (200 OK 或 404)

### ❌ 如果出现问题

1. **没有看到 POST token 请求**：
   - 环境变量未设置
   - Worker 代码未正确读取环境变量

2. **Token 请求返回 400/401**：
   - Client ID/Secret 错误
   - 凭证格式问题

3. **TDX API 返回 400/429**：
   - Token 未正确传递
   - Token 已过期
   - API 请求格式错误

---

## 🛠️ 修复步骤

### **步骤 1：重新部署 Worker（强制更新）**

我们刚刚更新了 Worker 代码，添加了详细的日志输出。您需要重新部署：

#### **方法 A：Cloudflare Dashboard（推荐）**

1. 前往 https://dash.cloudflare.com/
2. 点击 **Workers & Pages**
3. 找到 `flight-api-tdx` Worker
4. 点击 **Edit Code**
5. **完全删除**旧代码
6. **复制粘贴**新代码（从 `flight-api-tdx-worker.js`）
7. 点击 **Save and Deploy**

#### **方法 B：使用 Wrangler CLI**

```bash
cd "C:\Users\Admin\Documents\LIMO網站\cloudflare無後台\limo-website-main"

# 确保使用最新代码
wrangler deploy flight-api-tdx-worker.js --name flight-api-tdx
```

---

### **步骤 2：验证环境变量设置**

1. 前往 https://dash.cloudflare.com/
2. 点击 **Workers & Pages**
3. 选择 `flight-api-tdx`
4. 点击 **Settings** → **Variables**
5. 检查是否存在：
   - ✅ `TDX_ID` = 您的 Client ID
   - ✅ `TDX_SECRET` = 您的 Client Secret

#### **如果变量不存在或错误：**

1. 点击 **Add variable**
2. 添加/更新变量：
   ```
   Variable name: TDX_ID
   Value: 您的TDX_CLIENT_ID
   [✓] Encrypt
   ```
   
   ```
   Variable name: TDX_SECRET
   Value: 您的TDX_CLIENT_SECRET
   [✓] Encrypt
   ```

3. 点击 **Save and Deploy**

---

### **步骤 3：查看实时日志**

#### **使用 Cloudflare Dashboard**

1. 前往 https://dash.cloudflare.com/
2. 点击 **Workers & Pages**
3. 选择 `flight-api-tdx`
4. 点击顶部的 **Logs** 选项卡
5. 点击 **Begin log stream**

#### **使用 Wrangler CLI（更方便）**

```bash
wrangler tail flight-api-tdx
```

---

### **步骤 4：测试 Worker**

#### **测试 A：直接测试 Worker**

在浏览器中打开（或使用 curl）：

```
https://flight-api-tdx.bayterter.workers.dev/?flight=BR189
```

**✅ 成功的日志输出应该包含：**

```
🔧 [Worker Init] Environment check
   TDX_ID available: true
   TDX_SECRET available: true
🔐 [TDX Auth] Checking credentials...
   Client ID exists: true
   Client Secret exists: true
   Client ID length: 36
📤 [TDX Auth] Requesting access token...
   URL: https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token
📥 [TDX Auth] Response received
   Status: 200
   Status Text: OK
✅ [TDX Auth] Access token obtained successfully
   Token length: 1234
   Token preview: eyJhbGciOiJSUzI1NiIs...
   Expires in: 86400 seconds
🔍 [TDX API] Searching TPE for BR189...
📥 [TDX API] Response from TPE
   Status: 200
   Results: 1 flights found
✅ [TDX API] Flight BR189 found at TPE
```

**❌ 如果看到错误：**

```
❌ [TDX Auth] Missing credentials!
   Client ID: MISSING
   Client Secret: MISSING
```
→ **环境变量未设置或未生效，回到步骤 2**

```
❌ [TDX Auth] Token request failed!
   Status: 401
   Error: Invalid credentials
```
→ **Client ID/Secret 错误，检查 TDX 平台上的凭证**

```
❌ [TDX API] Request failed for TPE
   Status: 401
   Error: Unauthorized
```
→ **Token 未正确传递或已过期**

---

### **步骤 5：测试网站集成**

1. 前往 https://v-limo.com.tw/flight-search.html
2. 输入航班号（如 `BR189`）
3. 点击搜索
4. 打开浏览器开发者工具（F12）→ **Console** 选项卡
5. 查看日志输出

#### **✅ 成功的输出：**

```
✅ 使用真實 API
API Response: {flightNumber: "BR189", ...}
```

#### **❌ 失败的输出：**

```
API Error: Error: Flight not found
```

同时检查 **Network** 选项卡：
- 查找 `flight-api-tdx.bayterter.workers.dev` 请求
- 查看 Response 内容
- 如果是 500 错误，查看 Worker 日志

---

## 🔧 常见问题解决

### **问题 1：环境变量未生效**

**症状**：
```
❌ [TDX Auth] Missing credentials!
   Client ID: MISSING
   Client Secret: MISSING
```

**解决方案**：

1. **重新设置环境变量**：
   - Dashboard → Workers → flight-api-tdx → Settings → Variables
   - 删除旧变量（如果存在）
   - 重新添加 `TDX_ID` 和 `TDX_SECRET`
   - 确保勾选 **Encrypt**
   - 点击 **Save and Deploy**

2. **等待 2-3 分钟** 让 Cloudflare 全球网络更新

3. **重新测试** Worker URL

---

### **问题 2：Token 请求失败（401）**

**症状**：
```
❌ [TDX Auth] Token request failed!
   Status: 401
```

**解决方案**：

1. **验证 TDX 凭证**：
   - 前往 https://tdx.transportdata.tw/user/dataservice/key
   - 确认您的 Client ID 和 Client Secret
   - 复制时**不要包含空格或换行**

2. **重新生成凭证**（如果需要）：
   - 在 TDX 平台上删除旧的 Key
   - 创建新的 Key
   - 更新 Worker 环境变量

---

### **问题 3：TDX API 返回 400/429**

**症状**：
```
❌ [TDX API] Request failed for TPE
   Status: 400
```

**原因**：
- **400**：请求格式错误或 Token 无效
- **429**：请求频率过高（超过限制）

**解决方案**：

1. **检查 Token 是否成功获取**：
   - 查看日志中是否有 `✅ [TDX Auth] Access token obtained successfully`
   - 如果没有，回到问题 1 或 2

2. **检查 API 配额**：
   - 前往 https://tdx.transportdata.tw/user/dataservice/usage
   - 查看今日使用量（免费：50,000次/天）
   - 如果超过限制，等待第二天重置

3. **减少请求频率**：
   - 使用本地数据库作为备用
   - 实现 Token 缓存（Token 有效期 24 小时）

---

### **问题 4：Worker 代码未更新**

**症状**：
- 日志中没有看到新的 emoji 日志（🔐、📤、✅ 等）
- 还是显示旧的错误消息

**解决方案**：

1. **强制刷新 Worker 代码**：
   ```bash
   wrangler deploy flight-api-tdx-worker.js --name flight-api-tdx --force
   ```

2. **或在 Dashboard 中手动替换代码**：
   - 打开 Worker 编辑器
   - 全选删除旧代码（Ctrl+A, Delete）
   - 粘贴新代码
   - Save and Deploy

3. **清除浏览器缓存**：
   - 按 `Ctrl + Shift + R`（Windows）
   - 或 `Cmd + Shift + R`（Mac）

---

## 📊 完整的调试检查清单

### ✅ **逐步验证**

- [ ] **1. Worker 代码已更新**
  - 最新的 `flight-api-tdx-worker.js` 已部署
  - 包含详细的日志输出

- [ ] **2. 环境变量已设置**
  - `TDX_ID` 存在且加密
  - `TDX_SECRET` 存在且加密
  - 已点击 "Save and Deploy"

- [ ] **3. 凭证正确**
  - Client ID 与 TDX 平台一致
  - Client Secret 与 TDX 平台一致
  - 没有多余的空格或换行

- [ ] **4. Worker 日志可见**
  - 可以通过 Dashboard 或 Wrangler 查看日志
  - 日志显示详细的认证和请求过程

- [ ] **5. Token 获取成功**
  - 日志中显示 `✅ [TDX Auth] Access token obtained successfully`
  - Token 长度 > 1000 字符

- [ ] **6. TDX API 请求成功**
  - 日志中显示 `✅ [TDX API] Flight XXX found`
  - 或至少显示查询尝试（即使未找到航班）

- [ ] **7. 网站集成正常**
  - 前端可以调用 Worker
  - 浏览器 Console 无 CORS 错误
  - 航班数据正确显示

---

## 🆘 如果问题仍未解决

### **收集诊断信息**

1. **Worker 日志**（前 50 行）：
   ```bash
   wrangler tail flight-api-tdx
   ```

2. **环境变量截图**：
   - Dashboard → Workers → flight-api-tdx → Settings → Variables
   - 遮盖实际值，只显示变量名和是否加密

3. **浏览器 Console 输出**：
   - F12 → Console 选项卡
   - 完整的错误消息

4. **浏览器 Network 请求**：
   - F12 → Network 选项卡
   - 筛选 `flight-api`
   - Response 内容

5. **TDX 平台信息**：
   - 您的 Service Name
   - 今日 API 使用量
   - Client ID（前 8 个字符即可）

---

## 📞 需要帮助？

提供以上诊断信息，我可以帮您进一步排查问题！

**记住**：最常见的问题是**环境变量未设置**或**Worker 代码未更新**。请先检查这两项！ 🚀


# 🚀 Cloudflare Worker 部署指南

本指南將帶您完成航班 API Worker 的部署流程。

---

## 📋 前置條件

- ✅ Cloudflare 帳號（已註冊）
- ✅ `flight-api-worker.js` 文件（已包含 API Key）

---

## 🎯 方法1：使用 Cloudflare Dashboard（推薦）

### 步驟 1：登入 Cloudflare

1. 前往 https://dash.cloudflare.com/
2. 使用您的帳號登入

### 步驟 2：創建 Worker

1. 點擊左側菜單的 **Workers & Pages**
2. 點擊右上角的 **Create application**
3. 選擇 **Create Worker**
4. 在 **Worker name** 輸入：`flight-api`
5. 點擊 **Deploy**

### 步驟 3：編輯 Worker 代碼

1. 部署完成後，點擊 **Edit code** 按鈕
2. 刪除編輯器中的所有默認代碼
3. 打開本地的 `flight-api-worker.js` 文件
4. **複製全部內容**（Ctrl+A → Ctrl+C）
5. 貼到 Cloudflare 編輯器中（Ctrl+V）
6. 點擊右上角的 **Save and Deploy**

### 步驟 4：獲取 Worker URL

部署成功後，您會看到一個 URL，格式類似：
```
https://flight-api.您的用戶名.workers.dev
```

**複製這個 URL！**

### 步驟 5：更新網站代碼

1. 打開本地的 `flight-search.html`
2. 找到第 823 行附近的代碼：
   ```javascript
   const WORKER_API_URL = 'https://flight-api.bayterter.workers.dev';
   ```
3. 將 URL 替換為您的 Worker URL
4. 將第 827 行改為：
   ```javascript
   const USE_REAL_API = WORKER_API_URL !== ''; // 啟用真實 API
   ```
5. 保存文件，提交並推送到 GitHub

### 步驟 6：測試

1. 清除瀏覽器緩存
2. 訪問 `flight-search.html` 頁面
3. 輸入航班號（如 `EK387`）進行測試

---

## 🔧 方法2：使用 Wrangler CLI（進階用戶）

### 步驟 1：檢查 Wrangler

您已經安裝了 Wrangler v4.38.0 ✅

### 步驟 2：登入 Cloudflare

```bash
wrangler login
```

這會打開瀏覽器進行授權。

### 步驟 3：創建 Worker 配置

在項目根目錄創建 `wrangler-flight-api.toml`：

```toml
name = "flight-api"
main = "flight-api-worker.js"
compatibility_date = "2024-12-15"

[env.production]
routes = []
```

### 步驟 4：部署

```bash
wrangler deploy --config wrangler-flight-api.toml
```

### 步驟 5：查看 Worker URL

部署成功後，終端會顯示 Worker URL。

---

## ⚠️ 常見問題

### Q1: 404 錯誤
**原因**：Worker 沒有正確部署
**解決**：按照上述步驟重新部署

### Q2: API 返回錯誤
**原因**：API Key 無效或配額用完
**解決**：檢查 AviationStack 帳戶狀態

### Q3: CORS 錯誤
**原因**：Worker 代碼中缺少 CORS headers
**解決**：確保使用了最新的 `flight-api-worker.js` 代碼

---

## 📊 AviationStack 免費方案限制

- ✅ 每月 100 次 API 調用
- ✅ 僅限歷史航班和當前航班
- ❌ 不支持未來航班預測

**建議**：
- 保留本地數據庫作為後備方案
- 監控 API 使用量（在 AviationStack Dashboard）

---

## 🎯 下一步

1. **測試本地數據庫**：
   - 現在 `USE_REAL_API = false`，可以立即測試
   - 查詢本地的 11 個航班

2. **部署 Worker**：
   - 使用上述方法部署 Worker
   - 更新 `flight-search.html` 的 Worker URL

3. **清除 Cloudflare 緩存**：
   - 按照 `CACHE-PURGE-GUIDE.md` 的步驟
   - 確保所有訪問者看到最新版本

---

## 📞 支援

如遇問題，請提供：
- Worker URL
- 錯誤訊息截圖
- 瀏覽器 Console 日誌


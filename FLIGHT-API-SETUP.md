# 航班 API 整合指南

## 📋 完整設置步驟

### 步驟 1：申請 AviationStack API Key

1. **註冊帳號**
   - 訪問：https://aviationstack.com/
   - 點擊 "Get Free API Key" 
   - 填寫註冊資訊（Email、密碼）

2. **選擇免費方案**
   - Free Plan：每月 500 次請求
   - 足夠個人網站使用
   - 無需信用卡

3. **獲取 API Key**
   - 登入後進入 Dashboard
   - 複製您的 `access_key`
   - 範例：`a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

### 步驟 2：部署 Cloudflare Worker

#### 2.1 登入 Cloudflare Dashboard

1. 前往：https://dash.cloudflare.com/
2. 選擇您的帳號
3. 點擊左側選單 **Workers & Pages**

#### 2.2 創建新 Worker

1. 點擊 **Create application**
2. 選擇 **Create Worker**
3. 命名 Worker：`flight-api` （或任何您喜歡的名稱）
4. 點擊 **Deploy**

#### 2.3 編輯 Worker 代碼

1. 部署後，點擊 **Edit code**
2. 刪除預設代碼
3. 複製 `flight-api-worker.js` 的全部內容
4. 貼上到編輯器中
5. **重要：** 找到這一行：
   ```javascript
   const AVIATIONSTACK_API_KEY = 'YOUR_API_KEY_HERE';
   ```
   將 `YOUR_API_KEY_HERE` 替換為您的 AviationStack API Key

6. 點擊右上角 **Save and Deploy**

#### 2.4 獲取 Worker URL

部署成功後，您會看到 Worker URL，格式類似：
```
https://flight-api.YOUR-USERNAME.workers.dev
```

**複製這個 URL，稍後會用到！**

---

### 步驟 3：更新網站代碼

打開 `flight-search.html`，找到這一行（約在第 830 行）：

```javascript
// TODO: 替換為您的 Cloudflare Worker URL
const WORKER_API_URL = 'https://flight-api.YOUR-USERNAME.workers.dev';
```

將其替換為您的實際 Worker URL。

---

### 步驟 4：測試

1. 部署更新到 Cloudflare Pages
2. 訪問航班查詢頁面
3. 輸入真實航班號碼，例如：
   - `BR123` (長榮航空)
   - `CI001` (中華航空)
   - `TW669` (德威航空)
4. 點擊查詢，應該會顯示真實航班資訊！

---

## 🔒 安全性說明

### 為什麼需要 Cloudflare Worker？

❌ **不要這樣做：** 在前端直接調用 AviationStack API
```javascript
// 錯誤示範 - API Key 會暴露在瀏覽器中！
fetch(`https://api.aviationstack.com/v1/flights?access_key=YOUR_KEY&flight=${number}`)
```

✅ **正確做法：** 使用 Worker 作為代理
```javascript
// 安全 - API Key 隱藏在 Worker 中
fetch(`https://flight-api.YOUR-USERNAME.workers.dev?flight=${number}`)
```

**優點：**
- ✅ API Key 不會暴露在前端代碼中
- ✅ 可以添加速率限制
- ✅ 可以快取常見查詢，節省 API 配額
- ✅ 可以格式化返回數據

---

## 📊 API 限制

### AviationStack 免費方案

- **每月請求：** 500 次
- **速率限制：** 無
- **即時數據：** 僅支援付費方案
- **歷史數據：** 1 個月內
- **支援的航空公司：** 全球主要航空公司

### 節省配額建議

1. **本地快取**：將常見航班結果快取在瀏覽器
2. **示例數據**：保留一些示例航班，減少 API 調用
3. **僅查詢必要數據**：使用最小化的 API 參數

---

## 🛠️ 進階設定（可選）

### 使用環境變數存儲 API Key

更安全的方式是使用 Worker 的環境變數：

1. 在 Cloudflare Dashboard → Workers → 您的 Worker
2. 點擊 **Settings** → **Variables**
3. 添加環境變數：
   - Name: `AVIATIONSTACK_API_KEY`
   - Value: 您的 API Key
4. 點擊 **Encrypt** （推薦）
5. **Save**

然後修改 Worker 代碼：

```javascript
// 改為從環境變數讀取
const AVIATIONSTACK_API_KEY = env.AVIATIONSTACK_API_KEY;
```

完整代碼：
```javascript
export default {
  async fetch(request, env) {
    const AVIATIONSTACK_API_KEY = env.AVIATIONSTACK_API_KEY;
    // ... 其餘代碼
  }
}
```

---

## 🆘 常見問題

### Q: 顯示 "Flight not found"

**可能原因：**
1. 航班號碼格式錯誤（需要 IATA 代碼，如 `BR123`）
2. 航班不在 AviationStack 數據庫中
3. 免費方案不支援即時數據

**解決方案：**
- 使用快速查詢連結查詢主要航空公司
- 保留本地示例航班作為備案

### Q: API 請求超過限制

**解決方案：**
1. 升級到付費方案
2. 實作本地快取
3. 添加示例航班數據作為備用

### Q: Worker 部署失敗

**檢查：**
1. 代碼中是否有語法錯誤
2. API Key 是否正確替換
3. Worker 名稱是否唯一

---

## 📚 相關資源

- [AviationStack 官方文檔](https://aviationstack.com/documentation)
- [Cloudflare Workers 文檔](https://developers.cloudflare.com/workers/)
- [航班 IATA 代碼查詢](https://www.iata.org/en/publications/directories/code-search/)

---

## ✅ 設置完成檢查清單

- [ ] 已申請 AviationStack API Key
- [ ] 已創建 Cloudflare Worker
- [ ] 已將 API Key 添加到 Worker 代碼
- [ ] 已獲取 Worker URL
- [ ] 已更新 flight-search.html 中的 WORKER_API_URL
- [ ] 已部署到 Cloudflare Pages
- [ ] 已測試航班查詢功能

完成以上步驟後，您的航班查詢功能就可以查詢真實的全球航班資訊了！🎉


# 🔍 TDX API 429 錯誤診斷報告

## ✅ 好消息：您的 Worker 配置完全正確！

根據日誌分析：

```
✅ [TDX Auth] Access token obtained and cached
   Token length: 1026
   Expires in: 86400 seconds
🔍 [TDX API] Searching TPE for BR189...
```

這表示：
- ✅ **環境變數設置成功**（TDX_ID 和 TDX_SECRET）
- ✅ **TDX 認證成功**（Access Token 獲取成功）
- ✅ **Worker 代碼運行正常**
- ✅ **正在成功調用 TDX API**

---

## ⚠️ 問題：上游 TDX API 的速率限制

從日誌可以看到：

```
⏳ [TDX API] 429 received. Backing off for 56000 ms (attempt 1/1)
```

**這是 TDX API 自己返回的 429 錯誤**，不是您 Worker 的問題。

### 可能的原因

1. **短時間內測試過多**
   - 您可能在幾分鐘內測試了多次
   - TDX API 有每秒/每分鐘的請求限制

2. **TDX API 對新 Token 的限制**
   - 新獲取的 Access Token 可能有暫時性限制
   - 需要等待幾分鐘讓限制重置

3. **當日配額問題**
   - 免費方案：50,000 次/天
   - 需要檢查是否接近配額上限

---

## 🛠️ 解決方案

### 方案 1：等待並重試（最簡單）

**步驟 1：等待 2-3 分鐘**

TDX API 的速率限制通常會在短時間內重置。

**步驟 2：清除瀏覽器緩存**

按 `Ctrl + Shift + R` 強制重新載入。

**步驟 3：重新測試**

在瀏覽器中打開：
```
https://flight-api-tdx.bayterter.workers.dev/?flight=BR189
```

### 方案 2：檢查 TDX API 配額使用情況

**前往 TDX 平台查看使用量：**

1. 訪問：https://tdx.transportdata.tw/user/dataservice/usage
2. 登入您的 TDX 帳號
3. 查看：
   - 今日已使用次數
   - 剩餘配額
   - 使用趨勢圖

**如果配額已用完：**
- 免費方案每天 50,000 次
- 等待隔天凌晨 00:00 重置
- 或考慮升級方案

### 方案 3：使用不同的測試航班

某些熱門航班可能被其他用戶頻繁查詢，嘗試其他航班：

```
https://flight-api-tdx.bayterter.workers.dev/?flight=TW669
https://flight-api-tdx.bayterter.workers.dev/?flight=CI001
https://flight-api-tdx.bayterter.workers.dev/?flight=BR216
```

---

## 📊 TDX API 速率限制詳情

根據 TDX 官方文檔：

| 限制類型 | 限制值 |
|---------|-------|
| **每秒請求次數** | 60 次 |
| **每分鐘請求次數** | 未明確說明（通常是每秒的倍數） |
| **每天請求次數** | 50,000 次（免費方案） |

### 觸發 429 的常見情況

1. **連續快速測試**
   - 在 5 秒內查詢 3-4 次
   - 每次查詢可能觸發 2-4 個 API 請求

2. **重複查詢同一航班**
   - 雖然 Worker 有快取，但快取失效後會重新查詢
   - 快取時間：5 分鐘

3. **多個用戶同時使用**
   - 如果網站有多個訪客同時查詢
   - 所有請求共用同一組 TDX 憑證

---

## ✅ 已實施的緩解措施

您的 Worker 已經包含以下優化：

### 1. 自動重試機制
```javascript
⏳ [TDX API] 429 received. Backing off for 56000 ms (attempt 1/1)
```
Worker 會自動等待後重試（最多 1 次）。

### 2. 結果快取
```javascript
const RESULT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 分鐘快取
```
相同航班 5 分鐘內直接返回快取，不會觸發 TDX API。

### 3. Token 快取
```javascript
✅ [TDX Auth] Access token obtained and cached
   Expires in: 86400 seconds
```
Access Token 有效期內不會重複請求（24 小時）。

### 4. 速率限制
```javascript
const RATE_LIMIT_MAX = 30; // 每 60 秒最多 30 次
```
Worker 層面的限流保護。

---

## 🧪 測試建議

### 合理的測試頻率

**✅ 建議：**
- 每次測試間隔至少 **10-15 秒**
- 避免短時間內連續測試同一航班
- 利用快取：5 分鐘內重複查詢會命中快取

**❌ 避免：**
- 連續快速點擊查詢按鈕
- 短時間內測試 10+ 個不同航班
- 在多個瀏覽器標籤同時測試

### 測試步驟

1. **首次測試**：等待 2-3 分鐘
   ```
   https://flight-api-tdx.bayterter.workers.dev/?flight=BR189
   ```

2. **觀察日誌**：
   - 如果成功：會看到航班數據
   - 如果仍然 429：再等待 2 分鐘

3. **測試快取**：5 分鐘內再次查詢同一航班
   - 應該看到：`⚡ [Cache] Returning cached flight result`
   - 響應速度會更快

---

## 📱 在網站上測試

等待 TDX API 限制重置後，前往您的網站測試：

1. 訪問：https://v-limo.com.tw/flight-search.html
2. 輸入航班號：`BR189`
3. 點擊「查詢航班」
4. 按 F12 查看 Console

**成功的輸出應該包含：**
```
✅ 航班資訊成功獲取
即時API 標籤顯示
```

---

## 🔧 進階優化（可選）

如果經常遇到 429 錯誤，可以考慮：

### 1. 增加前端防抖

在 `flight-search.html` 中添加：

```javascript
let searchDebounce;
function searchFlight() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    performActualSearch();
  }, 1000); // 1 秒防抖
}
```

### 2. 顯示友善的錯誤訊息

當遇到 429 時：
```javascript
if (response.status === 429) {
  alert('查詢過於頻繁，請稍後再試（約 1 分鐘）');
}
```

### 3. 實施前端快取

在瀏覽器端也快取查詢結果：
```javascript
const localCache = new Map();
// 快取 5 分鐘
```

---

## 📞 下一步行動

### 立即執行

1. ⏰ **等待 2-3 分鐘**
2. 🔄 **重新部署更新的 Worker**（已修復警告）
3. 🧪 **重新測試** Worker URL
4. 📊 **檢查 TDX 配額**

### 驗證成功的標準

✅ Worker URL 返回航班 JSON 數據  
✅ 沒有 429 錯誤  
✅ 網站航班查詢功能正常  
✅ 快取機制運作正常  

---

## 🎯 總結

**您的配置沒有問題！** 

出現 429 是因為：
- TDX API 自身的速率限制被觸發
- 短時間內測試次數過多

**解決方法很簡單：**
- ⏰ 等待 2-3 分鐘
- 🧪 間隔測試
- 📊 檢查配額

**已完成的優化：**
- ✅ Worker 速率限制調整
- ✅ 快取機制實施
- ✅ 自動重試機制
- ✅ 模組語法修復

---

**等待幾分鐘後重新測試，應該就能正常工作了！** 🚀✈️


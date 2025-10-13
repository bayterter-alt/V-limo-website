# 🔍 TDX 航班查詢問題診斷與修復

## 問題：Cloudflare 預覽中無法正確查詢航班

### ✅ 已修復的問題

1. **環境變數讀取方式** - 已更新為正確的 Cloudflare Workers 格式
2. **同時支援 ES Modules 和 Service Worker 格式**

---

## 🚀 修復步驟（請依序執行）

### 步驟 1：檢查環境變數設置

您需要在 Cloudflare Dashboard 中設置 TDX API 憑證：

1. 前往 https://dash.cloudflare.com/
2. 點擊 **Workers & Pages**
3. 找到並點擊 `flight-api-tdx` Worker
4. 點擊 **Settings** → **Variables**
5. 檢查是否存在以下變數：
   - `TDX_ID` = 您的 TDX Client ID
   - `TDX_SECRET` = 您的 TDX Client Secret（應該加密）

#### ❌ 如果變數不存在或錯誤：

**添加 TDX_ID**：
1. 點擊 **Add variable**
2. Variable name: `TDX_ID`
3. Value: `您的TDX Client ID`（從 https://tdx.transportdata.tw/user/dataservice/key 取得）
4. Type: 文字（不需要加密）
5. 點擊 **Save**

**添加 TDX_SECRET**：
1. 點擊 **Add variable**
2. Variable name: `TDX_SECRET`
3. Value: `您的TDX Client Secret`
4. Type: **必須選擇「加密」(Encrypt)**
5. 點擊 **Save**

6. 最後點擊 **Deploy** 按鈕使變數生效

---

### 步驟 2：重新部署 Worker

有兩種方式可以重新部署：

#### **方法 A：使用 Cloudflare Dashboard（推薦）**

1. 前往 https://dash.cloudflare.com/
2. Workers & Pages → `flight-api-tdx`
3. 點擊 **Quick Edit**
4. 複製本地 `flight-api-tdx-worker.js` 的完整內容
5. 貼上並覆蓋所有舊代碼
6. 點擊 **Save and Deploy**

#### **方法 B：使用命令列（Wrangler）**

在 PowerShell 中執行：

```powershell
# 確保在專案目錄下
cd "C:\Users\Admin\Documents\LIMO網站\cloudflare無後台\limo-website-main"

# 部署 Worker
npx wrangler deploy flight-api-tdx-worker.js --name flight-api-tdx --compatibility-date 2024-01-15
```

---

### 步驟 3：測試 Worker

#### 測試 A：直接測試 Worker URL

在瀏覽器中打開：

```
https://flight-api-tdx.bayterter.workers.dev/?flight=BR189
```

#### ✅ 成功的響應應該包含：

```json
{
  "flightNumber": "BR189",
  "airline": "長榮航空",
  "status": "scheduled",
  "departure": { ... },
  "arrival": { ... }
}
```

#### ❌ 如果看到錯誤：

**錯誤 1：環境變數未設置**
```json
{
  "error": "Failed to fetch flight data",
  "message": "Failed to get TDX access token"
}
```
→ 回到步驟 1，確認環境變數已正確設置

**錯誤 2：TDX 憑證錯誤**
```json
{
  "error": "Failed to fetch flight data",
  "message": "Authentication failed"
}
```
→ 檢查您的 TDX Client ID 和 Secret 是否正確

---

### 步驟 4：查看 Worker 日誌

#### 使用 Cloudflare Dashboard：

1. Workers & Pages → `flight-api-tdx`
2. 點擊 **Logs** 選項卡
3. 點擊 **Begin log stream**
4. 在另一個視窗測試查詢航班
5. 觀察日誌輸出

#### 使用命令列（更方便）：

```powershell
npx wrangler tail flight-api-tdx
```

然後在瀏覽器中測試查詢，您應該會看到詳細的日誌：

#### ✅ 成功的日誌：

```
🔧 [Worker Init] Environment check
   TDX_ID available: true
   TDX_SECRET available: true
🔐 [TDX Auth] Checking credentials...
   Client ID exists: true
   Client Secret exists: true
📤 [TDX Auth] Requesting access token...
✅ [TDX Auth] Access token obtained successfully
   Token length: 1234
🔍 [TDX API] Searching TPE for BR189...
✅ [TDX API] Flight BR189 found at TPE
```

#### ❌ 失敗的日誌：

```
🔧 [Worker Init] Environment check
   TDX_ID available: false
   TDX_SECRET available: false
❌ [TDX Auth] Missing credentials!
```
→ 環境變數未設置或未生效

---

### 步驟 5：測試網站集成

1. 前往 https://v-limo.com.tw/flight-search.html
2. 輸入航班號（例如：`BR189`, `TW669`, `CI001`）
3. 點擊「查詢航班」
4. 按 F12 打開開發者工具
5. 查看 **Console** 和 **Network** 選項卡

#### ✅ 成功的表現：

- 航班資訊正確顯示
- 航班號旁邊顯示「即時API」綠色標籤
- Console 沒有錯誤訊息
- Network 中看到對 `flight-api-tdx.bayterter.workers.dev` 的請求返回 200

---

## 🧪 推薦測試航班

這些航班通常都有班次，適合測試：

- `TW669` - 德威航空（韓國仁川 → 桃園）
- `TW668` - 德威航空（桃園 → 韓國仁川）
- `BR189` - 長榮航空（香港 → 桃園）
- `CI001` - 中華航空（桃園 → 東京羽田）
- `BR216` - 長榮航空（新加坡 → 桃園）

---

## 📋 常見問題

### Q1: Worker 日誌顯示 "TDX_ID available: false"

**原因**：環境變數未設置或未生效

**解決**：
1. 確認在 Dashboard 中已添加變數
2. 確認已點擊 **Deploy** 按鈕
3. 等待 2-3 分鐘讓變數生效
4. 清除瀏覽器緩存後重試

### Q2: TDX API 返回 401 錯誤

**原因**：Client ID 或 Secret 錯誤

**解決**：
1. 前往 https://tdx.transportdata.tw/user/dataservice/key
2. 確認您的憑證
3. 重新複製並更新 Worker 環境變數
4. 確保複製時沒有多餘空格

### Q3: 查詢顯示 "找不到航班"

**可能原因**：
1. 該航班今天沒有班次
2. 航班號輸入錯誤
3. 該航班不是從台灣機場起降

**解決**：
1. 嘗試其他測試航班號
2. 使用快速查詢連結查詢即時航班
3. 確認航班號格式正確（如 BR189, 不是 BR-189）

### Q4: Worker 部署成功但查詢還是失敗

**檢查清單**：
- [ ] Worker 代碼已更新（包含最新的環境變數讀取邏輯）
- [ ] 環境變數已設置（TDX_ID 和 TDX_SECRET）
- [ ] 已點擊 Deploy 按鈕
- [ ] 已等待 2-3 分鐘
- [ ] 已清除瀏覽器緩存
- [ ] Worker URL 正確（https://flight-api-tdx.bayterter.workers.dev）

---

## 🆘 還是無法解決？

請提供以下資訊：

1. **Worker 日誌輸出**（前 50 行）
2. **瀏覽器 Console 錯誤訊息**
3. **環境變數設置截圖**（遮蓋實際值）
4. **測試的航班號**
5. **錯誤發生的時間**

這樣我可以更精準地幫您診斷問題！

---

## ✅ 成功檢查清單

完成以下所有項目後，您的 TDX 航班查詢應該可以正常運作：

- [ ] TDX 帳號已註冊
- [ ] TDX Client ID 和 Secret 已取得
- [ ] Cloudflare Worker 環境變數已設置（TDX_ID, TDX_SECRET）
- [ ] Worker 代碼已更新並部署
- [ ] Worker URL 測試成功（返回航班數據）
- [ ] Worker 日誌顯示正常（TDX_ID available: true）
- [ ] 網站航班查詢功能正常
- [ ] 航班資訊顯示「即時API」標籤

---

**祝您成功！如有問題隨時告訴我。** 🚀✈️


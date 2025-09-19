# 🔧 Apps Script 郵件通知設置指南

## ⚠️ 重要：為什麼網站表單沒有觸發郵件通知

**根本原因**：Apps Script 必須設置在 **正確的 Google Sheets** 中！

### 📊 ID 關係說明

- **Google Forms ID**: `1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A` (表單)
- **Google Sheets ID**: `1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU` (試算表)

### 🔄 資料流程

```
網站表單 → Google Forms → Google Sheets → Apps Script → 郵件通知
```

## 📋 正確設置步驟

### 步驟 1：確認 Google Sheets 連接

1. **前往您的 Google Forms**：
   ```
   https://docs.google.com/forms/d/1EcP0lRyBuZP8LUPHdlgrZYzBoHANATrVwgK7QEpou0A/edit
   ```

2. **檢查試算表連接**：
   - 點擊 **「回應」** 分頁
   - 確認顯示：「回應將儲存至試算表」
   - 如果沒有連接，點擊綠色試算表圖示建立連接

### 步驟 2：前往正確的 Google Sheets

**⚠️ 關鍵：必須在這個特定的試算表中設置 Apps Script**

```
https://docs.google.com/spreadsheets/d/1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU/edit
```

### 步驟 3：設置 Apps Script

1. **在上述 Google Sheets 中**，點擊：
   ```
   擴充功能 → Apps Script
   ```

2. **刪除預設程式碼**：
   - 刪除所有內容

3. **貼上郵件通知程式碼**：
   - 複製 `google-forms-email-script.js` 的完整內容
   - 貼上到 Apps Script 編輯器
   - 按 **Ctrl+S** 儲存

### 步驟 4：建立觸發器

1. **在 Apps Script 中**，點擊左側 **觸發器** ⏰

2. **點擊 + 新增觸發器**

3. **設置觸發器**：
   ```
   選擇要執行的函式：onFormSubmit
   選擇活動來源：來自試算表
   選擇活動類型：表單提交時
   ```

4. **點擊儲存**並授權權限

### 步驟 5：測試系統

1. **執行測試函數**：
   - 在 Apps Script 中選擇 `testEmailNotification`
   - 點擊 **執行**
   - 檢查是否收到測試郵件

2. **實際表單測試**：
   - 前往網站表單
   - 提交測試資料
   - 檢查 Google Sheets 是否有新資料
   - 檢查是否收到郵件通知

## 🔍 故障排除

### 問題 1：Apps Script 設置在錯誤的試算表

**症狀**：Google Sheets 有資料但沒有郵件
**解決**：確保 Apps Script 設置在 ID 為 `1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU` 的試算表

### 問題 2：觸發器沒有監控正確的事件

**症狀**：Apps Script 沒有執行記錄
**解決**：重新建立觸發器，確保事件來源是「來自試算表」

### 問題 3：權限問題

**症狀**：Apps Script 執行失敗
**解決**：重新授權 Gmail 和 Google Sheets 權限

### 問題 4：Entry IDs 不正確

**症狀**：表單提交但 Google Sheets 沒有資料
**解決**：使用診斷工具檢查 Entry IDs

## 📧 郵件配置

當前配置會發送郵件到：
- **主要收件人**：rayterter@hotmail.com
- **副本收件人**：tcs-info@chuteng.com.tw, amy@chuteng.com.tw

## ✅ 驗證清單

- [ ] Google Forms 連接到正確的 Google Sheets
- [ ] Apps Script 設置在 Google Sheets 中（ID: 1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU）
- [ ] 觸發器設置為「表單提交時」
- [ ] Gmail 權限已授權
- [ ] 測試函數可以發送郵件
- [ ] 網站表單可以正常提交
- [ ] Google Sheets 收到表單資料
- [ ] Apps Script 執行記錄顯示觸發
- [ ] 收到實際的郵件通知

## 🎯 最重要的提醒

**請確保 Apps Script 設置在這個試算表中**：
```
https://docs.google.com/spreadsheets/d/1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU/edit
```

**而不是表單本身！**
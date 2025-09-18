# 🚀 Google 表單系統部署指南

## 📋 部署檢查清單

### ✅ 第一階段：建立 Google 表單

1. **建立 Google 表單**
   - 按照 `google-form-setup.md` 的指示建立表單
   - 記錄表單 ID 和試算表 ID

2. **取得 entry ID**
   - 開啟建立好的 Google 表單
   - 按 F12 開啟開發者工具
   - 在 Console 中貼上並執行以下代碼：
   ```javascript
   // 在 Google 表單頁面執行
   const inputs = document.querySelectorAll('input[name^="entry."], textarea[name^="entry."], select[name^="entry."]');
   const entryIds = {};
   inputs.forEach(input => {
     const container = input.closest('[data-params*="entry."]') || input.closest('.freebirdFormviewerViewItemsItemItem');
     const label = container?.querySelector('[data-value], .freebirdFormviewerViewItemsItemItemTitle')?.textContent?.trim() || input.placeholder || 'unknown';
     entryIds[label] = input.name;
   });
   console.table(entryIds);
   ```
   - 記錄所有 entry ID

### ✅ 第二階段：設定 Apps Script

3. **建立 Apps Script 專案**
   - 前往 https://script.google.com
   - 點擊「新專案」
   - 將 `apps-script-code.js` 的內容貼入
   - 更新設定區域的收件者資訊

4. **更新設定**
   ```javascript
   // 在 Apps Script 中更新這些設定
   const CONFIG = {
     RECIPIENTS: {
       '機場接送': {
         email: 'airport@chuteng.com.tw',  // 請更新為實際郵箱
         name: '機場接送部',
         cc: ['tcs-info@chuteng.com.tw']
       },
       // ... 其他設定
     }
   };
   ```

5. **安裝觸發器**
   - 在 Apps Script 中找到 `installTriggers` 函數
   - 將 `YOUR_FORM_ID_HERE` 替換為實際的表單 ID
   - 執行 `installTriggers` 函數

### ✅ 第三階段：更新網站

6. **更新 HTML**
   - 備份當前的 `聯絡我們.html`
   - 使用 `updated-contact-form.html` 中的表單代碼替換原有表單
   - 更新以下內容：
     ```html
     <!-- 替換這些佔位符 -->
     [GOOGLE_FORM_ACTION_URL] → https://docs.google.com/forms/d/e/[FORM_ID]/formResponse
     entry.NAME_ENTRY_ID → entry.123456789 (實際的姓名欄位 ID)
     entry.EMAIL_ENTRY_ID → entry.987654321 (實際的郵箱欄位 ID)
     <!-- 以此類推... -->
     ```

7. **更新 JavaScript**
   - 備份當前的 `script.js`
   - 將 `updated-script.js` 中的新代碼加入到 `script.js`
   - 更新設定：
     ```javascript
     const GOOGLE_FORM_CONFIG = {
       formId: 'YOUR_ACTUAL_FORM_ID',
       actionUrl: 'https://docs.google.com/forms/d/e/YOUR_ACTUAL_FORM_ID/formResponse',
       fields: {
         name: 'entry.123456789',      // 替換為實際 ID
         email: 'entry.987654321',     // 替換為實際 ID
         // ... 其他欄位
       }
     };
     ```

### ✅ 第四階段：測試

8. **功能測試**
   - 在本地測試表單提交
   - 檢查 Google 試算表是否收到資料
   - 驗證郵件是否正確發送
   - 測試自動回覆功能

9. **完整測試流程**
   ```javascript
   // 在網站的瀏覽器 Console 中執行
   testGoogleFormConnection(); // 測試連接
   ```

### ✅ 第五階段：部署上線

10. **部署到生產環境**
    - 確認所有設定正確
    - 將更新推送到 GitHub
    - 監控 Cloudflare Workers 部署狀態

## 🔧 設定範例

### Google 表單 entry ID 對應表
```javascript
// 範例 - 請替換為您的實際 ID
const FIELD_MAPPING = {
  name: 'entry.1234567890',    // 姓名
  email: 'entry.0987654321',   // 電子郵件  
  phone: 'entry.1111111111',   // 電話
  service: 'entry.2222222222', // 服務類型
  subject: 'entry.3333333333', // 主旨
  message: 'entry.4444444444'  // 訊息內容
};
```

### Apps Script 收件者設定
```javascript
RECIPIENTS: {
  '機場接送': {
    email: 'airport@chuteng.com.tw',
    name: '機場接送部',
    cc: ['tcs-info@chuteng.com.tw', 'manager@chuteng.com.tw']
  },
  '旅遊包車': {
    email: 'tour@chuteng.com.tw',
    name: '旅遊包車部', 
    cc: ['tcs-info@chuteng.com.tw']
  },
  '露營車出租': {
    email: 'camping@chuteng.com.tw',
    name: '露營車部',
    cc: ['tcs-info@chuteng.com.tw']
  },
  '貨車出租': {
    email: 'truck@chuteng.com.tw',
    name: '貨車部',
    cc: ['tcs-info@chuteng.com.tw']
  },
  '其他諮詢': {
    email: 'tcs-info@chuteng.com.tw',
    name: '客服中心',
    cc: ['amy@chuteng.com.tw']
  }
}
```

## ⚠️ 重要注意事項

1. **權限設定**
   - Apps Script 需要 Gmail 發送權限
   - 確認 Google 試算表的存取權限

2. **測試建議**
   - 先在測試環境完整測試
   - 建議保留 Formspree 作為備援幾天

3. **監控**
   - 監控 Apps Script 執行記錄
   - 檢查郵件發送狀況
   - 定期檢查試算表資料

4. **備援計劃**
   - 保留原始 Formspree 代碼作為備援
   - 準備快速切換機制

## 📞 技術支援

如遇到問題，請檢查：
1. Google 表單是否正確設定
2. Apps Script 是否有錯誤記錄
3. entry ID 是否正確對應
4. 郵箱設定是否正確

部署完成後，新的表單系統將提供：
- ✅ 完全自定義的郵件內容
- ✅ 智能路由到不同部門
- ✅ 專業的自動回覆
- ✅ 詳細的提交記錄
- ✅ 靈活的業務邏輯處理
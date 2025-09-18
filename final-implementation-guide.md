# 🚀 利盟租車 Google 表單系統 - 完整實施指南

## 📋 系統概覽

**您的表單配置**：
- **表單 ID**: `1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg`
- **試算表 ID**: `1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU`
- **表單網址**: https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/viewform
- **提交網址**: https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/formResponse

## 🎯 實施檢查清單

### ✅ 第一階段：準備 Google 服務

#### 1.1 設定 Google Apps Script
```bash
# 1. 前往 https://script.google.com
# 2. 建立新專案，命名為「利盟租車表單處理系統」
# 3. 將 configured-apps-script.js 的內容貼入
# 4. 儲存專案
```

#### 1.2 安裝觸發器
```javascript
// 在 Apps Script 中執行 installTriggers() 函數
// 這會自動設定表單提交觸發器
```

#### 1.3 測試 Apps Script
```javascript
// 在 Apps Script 中執行 testFormSubmit() 函數
// 檢查是否能正確發送郵件
```

### ✅ 第二階段：取得 Entry ID

#### 2.1 開啟您的 Google 表單
```
https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/viewform
```

#### 2.2 使用自動偵測腳本
按照 `entry-id-extraction-guide.md` 的指示：
1. 開啟開發者工具 (F12)
2. 執行 Entry ID 偵測腳本
3. 複製產生的設定代碼

#### 2.3 更新網站設定
將取得的 Entry ID 更新到 `configured-website-script.js` 中的 `GOOGLE_FORM_CONFIG.fields`

### ✅ 第三階段：更新網站代碼

#### 3.1 備份現有檔案
```bash
# 建議先備份
cp script.js script.js.backup
cp 聯絡我們.html 聯絡我們.html.backup
```

#### 3.2 更新 JavaScript 檔案
```javascript
// 將 configured-website-script.js 的內容加入到 script.js 的末尾
// 或者替換整個 Google 表單處理部分
```

#### 3.3 測試網站表單
在瀏覽器 Console 中執行：
```javascript
// 測試連接
testGoogleFormConnection();

// 填入測試資料
fillTestData();

// 驗證設定
validateEntryIDs();
```

### ✅ 第四階段：功能測試

#### 4.1 本地測試
1. 開啟聯絡我們頁面
2. 填寫表單並提交
3. 檢查：
   - 表單是否成功提交
   - 是否跳轉到感謝頁面
   - Google 試算表是否收到資料

#### 4.2 郵件測試
1. 檢查指定收件者是否收到通知郵件
2. 檢查客戶是否收到自動回覆
3. 驗證郵件內容格式正確

#### 4.3 錯誤處理測試
1. 測試無效 email 格式
2. 測試空白必填欄位
3. 測試網路連接失敗情況

### ✅ 第五階段：生產部署

#### 5.1 部署到網站
```bash
# 提交變更到 Git
git add .
git commit -m "Implement Google Form + Apps Script system

- Replace Formspree with Google Forms
- Add intelligent email routing
- Implement professional auto-reply
- Add comprehensive form validation

🤖 Generated with [Claude Code](https://claude.ai/code)"

# 推送到 GitHub
git push origin main
```

#### 5.2 監控部署
```bash
# 檢查 Cloudflare Workers 部署狀態
# 確認新版本已上線
```

#### 5.3 最終驗證
1. 在正式網站測試表單提交
2. 確認所有郵件功能正常
3. 檢查 Google 試算表記錄

## 🔧 配置參數總結

### Google 表單配置
```javascript
const GOOGLE_FORM_CONFIG = {
  formId: '1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg',
  sheetId: '1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU',
  actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/formResponse',
  
  // ⚠️ 這些 Entry ID 需要從實際表單中取得
  fields: {
    name: 'entry.XXXXXX',      // 待更新
    email: 'entry.XXXXXX',     // 待更新
    phone: 'entry.XXXXXX',     // 待更新
    service: 'entry.XXXXXX',   // 待更新
    subject: 'entry.XXXXXX',   // 待更新
    message: 'entry.XXXXXX'    // 待更新
  }
};
```

### 收件者配置
```javascript
const RECIPIENTS = {
  '機場接送': {
    email: 'tcs-info@chuteng.com.tw',
    name: '機場接送部',
    cc: ['rayterter@hotmail.com', 'amy@chuteng.com.tw']
  },
  // ... 其他服務類型
};
```

## 🎉 系統優勢

### 🆚 相比 Formspree 的改進

| 功能 | Formspree | Google 表單系統 |
|------|-----------|----------------|
| 郵件主旨 | 固定 | ✅ 可依服務類型自動調整 |
| 收件者分配 | 固定 | ✅ 智能路由到不同部門 |
| 郵件格式 | 基本 | ✅ 專業 HTML 模板 |
| 自動回覆 | 無 | ✅ 個人化自動回覆 |
| 數據管理 | 無 | ✅ Google 試算表整合 |
| 自定義性 | 有限 | ✅ 完全可自定義 |
| 成本 | 月費 | ✅ 免費（Google 額度） |

### 📧 郵件功能特色

#### 通知郵件 (給團隊)
- 📋 完整客戶資訊表格
- 🎯 依服務類型智能分配
- ⚡ 緊急處理提醒
- 🎨 專業視覺設計

#### 自動回覆 (給客戶)
- 📝 確認收到諮詢
- ⏰ 預估回覆時間
- 📞 緊急聯絡方式
- 🏆 公司優勢介紹

## 🛠️ 故障排除

### 常見問題

#### ❓ 表單提交後沒有收到郵件
**檢查項目**：
1. Apps Script 是否有錯誤記錄？
2. Gmail 權限是否正確設定？
3. 收件者 email 地址是否正確？
4. 觸發器是否正確安裝？

#### ❓ 網站表單顯示錯誤
**檢查項目**：
1. Entry ID 是否正確設定？
2. JavaScript Console 是否有錯誤？
3. 網路連接是否正常？
4. Google 表單是否可正常存取？

#### ❓ 自動回覆沒有發送
**檢查項目**：
1. 客戶 email 格式是否正確？
2. Apps Script 是否有 Gmail 發送權限？
3. 檢查 Apps Script 執行記錄

### 📞 緊急支援

如果系統出現問題，可以：
1. **快速回退**：還原到 Formspree 系統
2. **檢查記錄**：查看 Apps Script 執行記錄
3. **手動處理**：直接檢查 Google 試算表的提交記錄

## 📈 後續優化建議

### 短期 (1-2週)
- [ ] 監控系統穩定性
- [ ] 收集用戶反饋
- [ ] 優化郵件模板

### 中期 (1個月)
- [ ] 整合客戶管理系統 (CRM)
- [ ] 添加更多自動化功能
- [ ] 實施進階分析

### 長期 (3個月+)
- [ ] 添加即時通知 (LINE/Slack)
- [ ] 實施客戶滿意度調查
- [ ] 整合線上訂車系統

---

## 🎯 立即行動

**現在開始實施**：
1. ✅ 設定 Google Apps Script
2. ✅ 取得 Entry ID
3. ✅ 更新網站代碼
4. ✅ 測試系統功能
5. ✅ 部署到生產環境

**預計完成時間**：2-3 小時
**預期效果**：完全自定義的專業表單系統，提升客戶體驗和內部效率！
# 📋 Google 表單 Entry ID 提取指南

## 🎯 目標
取得您 Google 表單中每個欄位的實際 `entry ID`，用於網站表單與 Google 表單的資料對應。

## 📝 您的表單資訊
- **表單 ID**: `1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg`
- **表單網址**: https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/viewform
- **試算表 ID**: `1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU`

## 🔧 步驟一：開啟表單並準備工具

1. **開啟您的 Google 表單**：
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/viewform
   ```

2. **開啟開發者工具**：
   - 按 `F12` 鍵
   - 或 右鍵點擊 → 選擇「檢查」
   - 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

3. **切換到 Console 標籤**

## 🔍 步驟二：執行 Entry ID 偵測腳本

在 Console 中貼上以下完整代碼並按 Enter：

```javascript
// Google 表單 Entry ID 偵測器 v2.0
function extractFormEntryIds() {
  console.log('🔍 開始搜尋 Google 表單 entry ID...');
  console.log('=' .repeat(60));
  
  // 搜尋所有可能的表單欄位
  const inputs = document.querySelectorAll('input[name^="entry."], textarea[name^="entry."], select[name^="entry."]');
  
  if (inputs.length === 0) {
    console.error('❌ 找不到任何 entry 欄位，請確認：');
    console.log('1. 您是否在正確的 Google 表單頁面？');
    console.log('2. 表單是否已完全載入？');
    console.log('3. 表單是否有任何欄位？');
    return;
  }
  
  const entryMapping = {};
  let fieldCount = 0;
  
  inputs.forEach((input, index) => {
    fieldCount++;
    
    // 尋找標籤文字的多種方法
    let label = 'unknown';
    
    // 方法 1: 尋找標題元素
    const container = input.closest('[data-item-id], .freebirdFormviewerViewItemsItemItem, [role="listitem"]');
    if (container) {
      const titleElement = container.querySelector(
        '.freebirdFormviewerViewItemsItemItemTitle, ' +
        '[data-value], ' +
        '.exportItemTitle, ' +
        'h2, h3, ' +
        '.freebirdFormviewerViewHeaderTitle'
      );
      if (titleElement) {
        label = titleElement.textContent.trim();
      }
    }
    
    // 方法 2: 檢查 aria-label
    if (label === 'unknown' && input.getAttribute('aria-label')) {
      label = input.getAttribute('aria-label').trim();
    }
    
    // 方法 3: 檢查 placeholder
    if (label === 'unknown' && input.placeholder) {
      label = input.placeholder.trim();
    }
    
    // 方法 4: 檢查前面的 label 元素
    if (label === 'unknown') {
      const labelElement = document.querySelector(`label[for="${input.id}"]`);
      if (labelElement) {
        label = labelElement.textContent.trim();
      }
    }
    
    // 清理標籤文字
    label = label.replace(/\s*\*\s*$/, ''); // 移除必填星號
    label = label.replace(/\s+/g, ' '); // 標準化空格
    
    // 記錄結果
    entryMapping[label] = input.name;
    
    console.log(`📝 欄位 ${fieldCount}: ${label}`);
    console.log(`   Entry ID: ${input.name}`);
    console.log(`   類型: ${input.type || input.tagName.toLowerCase()}`);
    console.log('');
  });
  
  console.log('=' .repeat(60));
  console.log('📊 偵測結果摘要:');
  console.log(`✅ 找到 ${fieldCount} 個表單欄位`);
  console.log('');
  
  // 生成完整的對應表
  console.log('📋 完整的 Entry ID 對應表:');
  console.table(entryMapping);
  
  // 生成設定代碼
  console.log('=' .repeat(60));
  console.log('💻 請複製以下代碼到您的設定中:');
  console.log('=' .repeat(60));
  
  // 智能對應常見欄位名稱
  const commonMappings = {
    '姓名': ['您的姓名', '姓名', 'Name', '名字'],
    '電子郵件': ['電子郵件', 'Email', '郵箱', '信箱', 'email'],
    '電話': ['聯絡電話', '電話', 'Phone', '手機', '聯絡方式'],
    '服務類型': ['服務類型', '服務', 'Service', '類型'],
    '主旨': ['主旨', '標題', 'Subject', 'Title'],
    '訊息': ['訊息內容', '訊息', 'Message', '內容', '詳細描述', '需求描述']
  };
  
  const finalMapping = {};
  
  Object.entries(commonMappings).forEach(([key, variations]) => {
    for (const variation of variations) {
      if (entryMapping[variation]) {
        finalMapping[key] = entryMapping[variation];
        break;
      }
    }
    // 如果沒找到，使用第一個找到的 entry
    if (!finalMapping[key] && Object.keys(entryMapping).length > 0) {
      const availableEntries = Object.keys(entryMapping);
      if (availableEntries.length > Object.keys(finalMapping).length) {
        finalMapping[key] = entryMapping[availableEntries[Object.keys(finalMapping).length]];
      }
    }
  });
  
  console.log(`
const GOOGLE_FORM_CONFIG = {
  formId: '1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg',
  sheetId: '1AySXECv5cjF79YmeXY7uFwrM69-JQFG1B4MP6KD6hUU',
  actionUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSenj6mYT12Imp6jzQtmAC451BQy9vpDIb23LudUXTacKKJClg/formResponse',
  
  fields: {
    name: '${finalMapping['姓名'] || 'entry.XXXXXX'}',      // 姓名
    email: '${finalMapping['電子郵件'] || 'entry.XXXXXX'}',   // 電子郵件
    phone: '${finalMapping['電話'] || 'entry.XXXXXX'}',      // 電話
    service: '${finalMapping['服務類型'] || 'entry.XXXXXX'}', // 服務類型
    subject: '${finalMapping['主旨'] || 'entry.XXXXXX'}',    // 主旨
    message: '${finalMapping['訊息'] || 'entry.XXXXXX'}'     // 訊息內容
  }
};`);
  
  console.log('');
  console.log('=' .repeat(60));
  console.log('📝 手動對應參考:');
  Object.entries(entryMapping).forEach(([label, entryId]) => {
    console.log(`${label}: '${entryId}'`);
  });
  
  console.log('');
  console.log('✅ Entry ID 偵測完成！');
  console.log('請將上面的 GOOGLE_FORM_CONFIG 複製到您的 JavaScript 設定中。');
  
  return entryMapping;
}

// 執行偵測
extractFormEntryIds();
```

## 📋 步驟三：複製和應用設定

1. **複製產生的設定代碼**
   - 在 Console 結果中找到 `GOOGLE_FORM_CONFIG` 設定
   - 複製完整的設定代碼

2. **更新網站 JavaScript**
   - 開啟 `configured-website-script.js`
   - 找到 `GOOGLE_FORM_CONFIG` 區塊
   - 替換 `fields` 部分的 entry ID

## 🔍 步驟四：驗證設定

使用以下腳本驗證您的設定：

```javascript
// 驗證 Entry ID 設定
function validateEntryIDs() {
  console.log('🔍 驗證 Entry ID 設定...');
  
  const config = GOOGLE_FORM_CONFIG; // 您的設定
  let isValid = true;
  
  Object.entries(config.fields).forEach(([field, entryId]) => {
    if (entryId.includes('XXXXXX') || entryId.includes('000000')) {
      console.error(`❌ ${field}: ${entryId} (尚未設定)`);
      isValid = false;
    } else {
      console.log(`✅ ${field}: ${entryId}`);
    }
  });
  
  if (isValid) {
    console.log('🎉 所有 Entry ID 設定正確！');
  } else {
    console.log('⚠️ 請完成所有 Entry ID 的設定');
  }
  
  return isValid;
}

validateEntryIDs();
```

## 📱 常見問題解決

### ❓ 問題：找不到任何 entry 欄位
**解決方案**：
1. 確認您在表單的 viewform 頁面，不是編輯頁面
2. 重新整理頁面並等待完全載入
3. 確認表單確實包含欄位

### ❓ 問題：標籤顯示為 "unknown"
**解決方案**：
1. 手動檢查 HTML 結構
2. 在 Console 中查看 `document.querySelectorAll('input[name^="entry."]')` 的結果
3. 手動對應欄位

### ❓ 問題：表單顯示錯誤
**解決方案**：
1. 檢查表單權限設定
2. 確認表單 ID 正確
3. 嘗試使用無痕模式開啟

## 🎯 下一步

完成 Entry ID 提取後：
1. 更新 `configured-website-script.js` 中的設定
2. 部署到您的網站
3. 執行功能測試
4. 設定 Google Apps Script 觸發器

---

**需要協助？** 如果遇到問題，請提供 Console 中的錯誤訊息或偵測結果。
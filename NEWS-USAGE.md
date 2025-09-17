# 新聞系統使用說明

## 概述
利盟租車網站現在使用 JSON 檔案來管理最新消息，您可以透過編輯 `news.json` 檔案來新增、修改或刪除最新消息。

## 檔案結構
- `news.json` - 新聞資料檔案
- `js/news.js` - 新聞渲染功能
- `style.css` - 包含新聞樣式

## 如何更新最新消息

### 1. 編輯 news.json 檔案

#### 新增新聞
在 `news.json` 檔案的 `news` 陣列中新增項目：

```json
{
  "id": 6,
  "title": "您的新聞標題",
  "summary": "新聞摘要（顯示在卡片上）",
  "content": "完整的新聞內容（點擊閱讀更多時顯示）",
  "category": "promotion",
  "date": "2024-09-16",
  "featured": false,
  "image": "圖片網址（可選）"
}
```

#### 新聞欄位說明
- `id`: 唯一識別碼（數字）
- `title`: 新聞標題
- `summary`: 新聞摘要（約100字以內）
- `content`: 完整新聞內容
- `category`: 分類（promotion, service, news）
- `date`: 發布日期（YYYY-MM-DD格式）
- `featured`: 是否為精選新聞（true/false）
- `image`: 圖片網址（可選）

#### 可用分類
- `promotion` - 優惠活動
- `service` - 服務公告
- `news` - 公司動態

### 2. 修改現有新聞
找到對應的新聞項目，直接修改相關欄位即可。

### 3. 刪除新聞
從 `news` 陣列中移除對應的項目。

### 4. 修改分類
如需新增或修改分類，請編輯 `categories` 區塊：

```json
{
  "id": "new_category",
  "name": "新分類名稱",
  "active": false
}
```

### 5. 調整顯示設定
在 `settings` 區塊中可以調整：

```json
{
  "itemsPerPage": 3,        // 每頁顯示項目數
  "showPagination": true,   // 是否顯示分頁
  "showCategories": true,   // 是否顯示分類篩選
  "showImages": true,       // 是否顯示圖片
  "defaultSort": "date"     // 預設排序方式
}
```

## 重要提醒

1. **JSON格式**: 確保JSON格式正確，可使用線上JSON驗證工具檢查
2. **圖片網址**: 建議使用完整的圖片網址（https://...）
3. **日期格式**: 日期必須使用 YYYY-MM-DD 格式
4. **ID唯一性**: 每個新聞的ID必須是唯一的
5. **分類匹配**: 新聞的category必須對應categories中的id

## 範例：新增一則優惠活動

```json
{
  "id": 6,
  "title": "年終大回饋！租車享8折優惠",
  "summary": "年終感謝季，即日起至年底所有車型享有8折優惠，把握機會！",
  "content": "感謝各位客戶一年來的支持，利盟租車推出年終大回饋活動。即日起至12月31日，所有車型（含機場接送、旅遊包車、露營車、貨車）享有8折優惠。此優惠不與其他活動併用，詳情請洽客服專線：04-2520-8777",
  "category": "promotion",
  "date": "2024-09-16",
  "featured": true,
  "image": "https://example.com/promotion-image.jpg"
}
```

## 故障排除

如果新聞無法正常顯示：
1. 檢查JSON檔案格式是否正確
2. 確認檔案路徑是否正確
3. 檢查瀏覽器開發者工具的錯誤訊息
4. 確保所有欄位都有填寫（除了image為可選）

## 技術支援
如有技術問題，請聯絡開發團隊。
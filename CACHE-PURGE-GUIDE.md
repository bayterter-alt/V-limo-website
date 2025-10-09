# Cloudflare 快取清除指南

## 🚨 當您遇到以下情況時需要清除快取：

- ✅ 程式碼已更新，但網站沒有變化
- ✅ 兩個域名顯示不同的內容（v-limo.com.tw vs www.v-limo.com.tw）
- ✅ CSS/JS 樣式錯亂
- ✅ 翻譯內容沒有更新

---

## 📋 清除 Cloudflare 快取步驟

### 方法 1：完全清除快取（推薦）

1. **登入 Cloudflare Dashboard**
   - 前往：https://dash.cloudflare.com/

2. **選擇您的域名**
   - 點擊 `v-limo.com.tw`

3. **進入快取設定**
   - 左側選單 → **Caching** → **Configuration**

4. **清除所有快取**
   - 找到「Purge Cache」區塊
   - 點擊 **Purge Everything**
   - 確認清除

5. **等待生效**
   - 通常需要 30 秒到 5 分鐘
   - 全球 CDN 節點逐步更新

---

### 方法 2：針對特定檔案清除

如果只想清除特定檔案的快取：

1. 進入 **Caching** → **Configuration**
2. 選擇 **Custom Purge**
3. 輸入要清除的 URL，例如：
   ```
   https://v-limo.com.tw/flight-search.html
   https://v-limo.com.tw/js/i18n.js
   https://v-limo.com.tw/style.css
   ```
4. 點擊 **Purge**

---

### 方法 3：清除瀏覽器快取

**Chrome / Edge:**
1. 按 `Ctrl + Shift + Delete`
2. 選擇「快取的圖片和檔案」
3. 時間範圍選「不限時間」
4. 點擊「清除資料」

**或者使用無痕模式測試：**
- `Ctrl + Shift + N` (Windows)
- `Cmd + Shift + N` (Mac)

---

## 🔧 預防快取問題

### 1. 開發模式（暫時停用快取）

**適用場景：** 頻繁更新期間

1. Cloudflare Dashboard → 選擇域名
2. 左側選單 → **Caching** → **Configuration**
3. **Development Mode** → 開啟（ON）
4. 3 小時後自動關閉

**注意：** 開發模式會讓網站載入變慢，完成更新後記得關閉！

---

### 2. 使用版本號控制（長期方案）

在 HTML 中引用 CSS/JS 時加上版本號：

**目前：**
```html
<script src="js/i18n.js"></script>
<link rel="stylesheet" href="style.css">
```

**建議改為：**
```html
<script src="js/i18n.js?v=20250109"></script>
<link rel="stylesheet" href="style.css?v=20250109">
```

每次更新時修改版本號，強制瀏覽器載入新版本。

---

## ⚡ 快速檢查快取狀態

### 使用瀏覽器開發者工具

1. 打開網站
2. 按 `F12` 開啟開發者工具
3. 切換到 **Network** 分頁
4. 重新載入頁面（`Ctrl + R`）
5. 點擊任一檔案
6. 查看 **Headers** 區塊：
   - `cf-cache-status: HIT` = 使用快取（可能是舊版）
   - `cf-cache-status: MISS` = 沒有快取（最新版）
   - `cf-cache-status: BYPASS` = 略過快取

---

## 🎯 您目前的問題解決步驟

### 問題 1：語言切換按鈕樣式不同
### 問題 2：英文版頁尾顯示中文「航班查詢」

**建議操作：**

1. ✅ **清除 Cloudflare 快取**（方法 1）
2. ✅ **清除瀏覽器快取**
3. ✅ **等待 5 分鐘**
4. ✅ **用無痕模式測試** `v-limo.com.tw` 和 `www.v-limo.com.tw`
5. ✅ **確認兩者是否一致**

---

## 📊 快取設定檢查清單

- [ ] Cloudflare 快取已清除
- [ ] 瀏覽器快取已清除
- [ ] 等待 5-10 分鐘讓 CDN 更新
- [ ] 用無痕模式測試兩個域名
- [ ] 確認語言切換按鈕樣式一致
- [ ] 確認英文版頁尾翻譯正確

---

## 🆘 如果問題持續存在

請提供以下資訊：
1. 截圖兩個域名的差異
2. 瀏覽器 Console 的錯誤訊息
3. Network 分頁中 i18n.js 的快取狀態

我會進一步協助診斷！

---

**最後更新：** 2025-01-09


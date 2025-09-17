# 露營車出租頁面首圖置換系統
## RV Rental Hero Image Replacement System

此系統專為露營車出租頁面 (`露營車出租.html`) 設計，讓您能夠獨立更換首圖背景，而不影響其他頁面。

## 使用方法

### 方法一：直接修改 CSS 變數 (推薦)
在 `style.css` 檔案中找到以下位置（大約第 405-408 行）：

```css
/* 露營車出租頁面專用英雄區塊 - RV Rental Hero Image System */
.hero-rv-rental {
  --rv-hero-image: url('img/rv-hero-bg.jpg');
  background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), var(--rv-hero-image);
  background-attachment: fixed;
}
```

只需要修改 `--rv-hero-image` 的值，將 `img/rv-hero-bg.jpg` 替換為您想要的圖片路徑。

**範例：**
```css
--rv-hero-image: url('img/my-new-rv-image.jpg');
```

### 方法二：新增內嵌樣式
在 `露營車出租.html` 的 `<head>` 區塊中新增樣式：

```html
<style>
.hero-rv-rental {
  --rv-hero-image: url('img/your-custom-image.jpg');
}
</style>
```

### 方法三：使用外部圖片
您也可以使用外部圖片連結：

```css
--rv-hero-image: url('https://example.com/your-image.jpg');
```

## 視差效果 (Parallax Effect)

首圖現在已啟用視差滾動效果，當您滾動頁面時，背景圖片會以較慢的速度移動，創造出深度感和動態效果。

### 視差效果特色：
- **自動啟用**：所有首圖（包含一般頁面和露營車出租頁面）都已自動啟用視差效果
- **流暢滾動**：背景圖片會隨頁面滾動產生優雅的視差移動
- **深度感**：增強視覺層次和現代感的用戶體驗
- **響應式**：在不同裝置上都能正常運作

### 如何調整或關閉視差效果：

如果您想關閉視差效果，可以在 CSS 中移除 `background-attachment: fixed` 這一行：

```css
.hero-rv-rental {
  --rv-hero-image: url('img/rv-hero-bg.jpg');
  background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), var(--rv-hero-image);
  /* 移除這一行就會關閉視差效果 */
  /* background-attachment: fixed; */
}
```

## 圖片規格建議

- **尺寸**：建議至少 1920x1080 像素
- **格式**：JPG, PNG, WebP
- **檔案大小**：建議小於 500KB 以確保載入速度
- **構圖**：注意中央區域放置文字的視覺效果

## 圖片路徑說明

1. `img/filename.jpg` - 相對於網站根目錄的 img 資料夾
2. `../img/filename.jpg` - 上一層目錄的 img 資料夾
3. `https://domain.com/image.jpg` - 外部圖片連結

## 範例圖片替換

```css
/* 使用本地圖片 */
--rv-hero-image: url('img/camping-hero-new.jpg');

/* 使用相對路徑 */
--rv-hero-image: url('../assets/hero-background.jpg');

/* 使用外部連結 */
--rv-hero-image: url('https://images.unsplash.com/photo-rv-camping');
```

## 注意事項

1. 圖片會自動套用暗色遮罩 (rgba(0,0,0,0.5)) 以確保文字清晰可讀
2. 背景圖片會自動調整為覆蓋整個區域 (background-size: cover)
3. 圖片會置中顯示 (background-position: center)
4. 首圖已啟用視差效果 (parallax scrolling) 增強視覺體驗
5. 此設定僅影響露營車出租頁面，不會影響其他頁面的首圖

## 疑難排解

**Q: 圖片沒有顯示**
A: 請檢查圖片路徑是否正確，確認圖片檔案存在

**Q: 圖片顯示不完整**
A: 系統會自動裁切圖片以符合版面，請使用建議尺寸的圖片

**Q: 文字看不清楚**
A: 系統已內建暗色遮罩，如需調整可修改 linear-gradient 的透明度值
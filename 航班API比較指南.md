# 航班查詢 API 完整比較指南

## 🎯 目前使用狀況
您的網站目前使用：**TDX (台灣交通部運輸數據流通服務)**

---

## 📊 各種航班 API 詳細比較

### 1️⃣ TDX - 台灣交通部運輸數據流通服務 ⭐ 目前使用

**官網**: https://tdx.transportdata.tw/

**費用**: 
- ✅ **完全免費**
- 50,000 次/天
- 60 次/秒

**優點**:
- ✅ 台灣官方數據，最準確
- ✅ 完整支援桃園、松山、高雄、台中機場
- ✅ 免費額度超高
- ✅ 中文原生支援
- ✅ 即時更新（1-5分鐘）

**缺點**:
- ❌ 僅限台灣機場航班
- ❌ 無全球航班數據
- ❌ 文件較少英文資源

**最適合**: 台灣本地業務、機場接送服務

---

### 2️⃣ AviationStack ⭐ 推薦備選

**官網**: https://aviationstack.com/

**費用**:
```
免費版:    $0/月    - 100 次/月
Basic:     $49.99/月 - 10,000 次/月
Pro:       $149.99/月 - 100,000 次/月
```

**優點**:
- ✅ 全球航班覆蓋
- ✅ 歷史航班數據
- ✅ 簡單易用的 REST API
- ✅ 支援機場、航空公司、航線查詢
- ✅ JSON 格式回應

**缺點**:
- ❌ 免費版僅 100次/月（不夠用）
- ❌ 台灣航班可能不如 TDX 完整
- ❌ 需要付費才能實用

**範例代碼**:
```javascript
// AviationStack API 範例
const API_KEY = 'your_api_key';
const url = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=BR189`;

const response = await fetch(url);
const data = await response.json();
```

**適合情境**: 需要全球航班、有預算

---

### 3️⃣ FlightAware AeroAPI

**官網**: https://www.flightaware.com/commercial/aeroapi/

**費用**: 
- 需聯繫報價（約 $99+/月起）
- 企業級定價

**優點**:
- ✅ 業界頂級準確度
- ✅ 即時飛行追蹤
- ✅ 完整歷史數據
- ✅ 飛行路徑、高度等詳細資訊
- ✅ 99.9% 正常運行時間

**缺點**:
- ❌ 價格較高
- ❌ 需要商業授權
- ❌ 對小型網站來說太貴

**適合情境**: 大型企業、航空相關業務

---

### 4️⃣ Aviation Edge

**官網**: https://aviation-edge.com/

**費用**:
```
Starter:   $29/月  - 10,000 次
Basic:     $79/月  - 50,000 次
Pro:       $199/月 - 200,000 次
```

**優點**:
- ✅ 多種 API 端點（航班、機場、航空公司、航線）
- ✅ 即時和歷史數據
- ✅ 航班時刻表
- ✅ 合理的價格

**缺點**:
- ❌ 免費試用期後需付費
- ❌ 台灣數據覆蓋未知

**API 端點**:
- `/v2/public/flights` - 即時航班
- `/v2/public/timetable` - 航班時刻表
- `/v2/public/flightsFuture` - 未來航班
- `/v2/public/autocomplete` - 機場/航空公司搜尋

**適合情境**: 中等規模、需要多種數據

---

### 5️⃣ OpenSky Network ⭐ 免費開源

**官網**: https://opensky-network.org/

**費用**: **完全免費**（開源專案）

**優點**:
- ✅ 完全免費
- ✅ 即時飛行追蹤
- ✅ 開源、透明
- ✅ ADS-B 接收器網路
- ✅ 無請求限制（合理使用）

**缺點**:
- ❌ 較技術性，需要自己處理數據
- ❌ 無航班狀態、登機門等資訊
- ❌ 主要是飛行中的飛機位置
- ❌ 文件較少

**範例代碼**:
```javascript
// OpenSky Network API 範例
const url = 'https://opensky-network.org/api/states/all';
const response = await fetch(url);
const data = await response.json();

// 返回當前空中所有飛機的位置
```

**適合情境**: 即時飛行追蹤、開發者專案

---

### 6️⃣ RapidAPI - 多個航班 API 聚合平台

**官網**: https://rapidapi.com/

**可用的航班 API**:
1. **Flight Data** by aedbx
2. **Skyscanner Flight Search**
3. **Amadeus Flight Offers Search**
4. **Trawex Flight API**

**費用**: 因供應商而異（$0 - $100+/月）

**優點**:
- ✅ 一個平台多個選擇
- ✅ 統一的 API 金鑰管理
- ✅ 易於測試和切換供應商
- ✅ 部分有免費版

**缺點**:
- ❌ 需要逐一比較供應商
- ❌ 品質參差不齊

**適合情境**: 想快速測試多個 API

---

## 🎯 建議方案

### 方案 A: 目前方案（最推薦）✨

```
主要: TDX API (台灣航班)
備用: 本地數據庫
成本: $0/月
```

**優勢**:
- ✅ 完全免費
- ✅ 台灣航班最準確
- ✅ 符合您的業務需求（機場接送）
- ✅ 已實施且運作良好

**適合**: 您目前的業務（台灣機場接送服務）

---

### 方案 B: 雙 API 混合

```
主要: TDX API (台灣航班)
備用: AviationStack Basic ($49.99/月)
成本: $49.99/月
```

**優勢**:
- ✅ 台灣航班用 TDX（免費）
- ✅ 全球航班用 AviationStack
- ✅ 更完整的覆蓋

**適合**: 如果有國際客戶需求

---

### 方案 C: 全球航班方案

```
主要: AviationStack Pro ($149.99/月)
或: FlightAware AeroAPI (約$99+/月)
成本: $99-$150/月
```

**適合**: 擴展到全球市場

---

## 💡 實施建議

### 1. 繼續使用 TDX（推薦）

您目前的 TDX 實施已經非常好：
- ✅ 完全免費
- ✅ 台灣航班覆蓋完整
- ✅ 符合業務需求

**不需要更換**，除非有以下需求：
- 需要全球航班數據
- 需要歷史航班分析
- 需要更多航班詳細資訊

### 2. 如需擴展，建議順序：

#### Step 1: 評估需求
```
□ 需要全球航班嗎？
□ 預算多少？
□ 每月查詢量？
□ 需要什麼數據？
```

#### Step 2: 試用 API（免費試用）
1. **AviationStack** - 註冊免費帳號（100次/月）
2. **Aviation Edge** - 免費試用
3. **OpenSky Network** - 完全免費

#### Step 3: 實施混合方案

```javascript
// 混合 API 策略
async function searchFlight(flightNumber) {
  // 1. 判斷航班類型
  const isTaiwanFlight = checkIfTaiwanFlight(flightNumber);
  
  if (isTaiwanFlight) {
    // 使用 TDX API (免費)
    return await searchTDX(flightNumber);
  } else {
    // 使用國際 API
    return await searchAviationStack(flightNumber);
  }
}
```

---

## 🛠️ 快速實施：AviationStack 範例

如果要添加 AviationStack 作為備用：

### 1. 註冊帳號
https://aviationstack.com/signup/free

### 2. 獲取 API Key

### 3. 創建 Cloudflare Worker

```javascript
// flight-api-aviationstack.js
export default {
  async fetch(request, env) {
    const API_KEY = env.AVIATION_STACK_KEY;
    const url = new URL(request.url);
    const flight = url.searchParams.get('flight');
    
    const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${flight}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // 格式化數據
    if (data.data && data.data.length > 0) {
      const flight = data.data[0];
      return new Response(JSON.stringify({
        flightNumber: flight.flight.iata,
        airline: flight.airline.name,
        status: flight.flight_status,
        departure: {
          airport: flight.departure.airport,
          iata: flight.departure.iata,
          time: flight.departure.scheduled
        },
        arrival: {
          airport: flight.arrival.airport,
          iata: flight.arrival.iata,
          time: flight.arrival.scheduled
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Flight not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### 4. 更新前端代碼

```javascript
// flight-search.html
const TDX_API = 'https://flight-api-tdx.你的域名.workers.dev';
const AVIATION_STACK_API = 'https://flight-api-aviation.你的域名.workers.dev';

async function searchFlight(flightNumber) {
  // 先試 TDX
  try {
    const response = await fetch(`${TDX_API}?flight=${flightNumber}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('TDX failed, trying AviationStack...');
  }
  
  // TDX 失敗，試 AviationStack
  try {
    const response = await fetch(`${AVIATION_STACK_API}?flight=${flightNumber}`);
    return await response.json();
  } catch (error) {
    // 最後回退到本地數據
    return searchLocalDatabase(flightNumber);
  }
}
```

---

## 📞 其他選項：嵌入第三方小工具

如果不想管理 API，可以嵌入現成服務：

### 1. FlightRadar24 Widget
```html
<iframe 
  src="https://www.flightradar24.com/simple" 
  width="100%" 
  height="600">
</iframe>
```

### 2. FlightStats Widget
訪問：https://www.flightstats.com/v2/widgets

### 3. FlightAware Widget
```html
<iframe 
  src="https://zh.flightaware.com/live/flight/BR189"
  width="100%"
  height="500">
</iframe>
```

**優點**: 
- 完全免費
- 無需 API 管理
- 即時數據

**缺點**:
- 無法自訂樣式
- 使用者體驗較差
- 無法整合到預約流程

---

## 🎯 結論與建議

### 👍 建議保持目前方案（TDX）

**理由**:
1. ✅ **完全免費** - 節省成本
2. ✅ **台灣數據最準** - 您的主要市場
3. ✅ **額度充足** - 50,000次/天遠超需求
4. ✅ **已實施完成** - 運作良好

### 📈 未來擴展時機

考慮添加其他 API，當：
- 客戶經常查詢非台灣航班
- 需要全球航班支援
- 有預算支援付費 API
- 業務擴展到其他市場

### 💰 成本效益分析

```
目前方案 (TDX):
- 成本: $0/月
- 覆蓋: 台灣航班 100%
- 適合: 機場接送業務 ✅

AviationStack Basic:
- 成本: $49.99/月
- 覆蓋: 全球航班
- 適合: 國際業務擴展

自建爬蟲:
- 成本: 開發時間 + 維護
- 法律風險: ⚠️ 可能違反服務條款
- 不推薦: ❌
```

---

## 📚 參考資源

- TDX 官方文件: https://tdx.transportdata.tw/api-service/swagger
- AviationStack 文件: https://aviationstack.com/documentation
- FlightAware API: https://www.flightaware.com/commercial/aeroapi/
- OpenSky Network: https://opensky-network.org/apidoc/
- RapidAPI 航班類: https://rapidapi.com/category/Travel

---

**最後建議**: 您目前的 TDX 實施已經非常適合您的業務。除非有明確的全球航班需求，否則不需要更換。保持簡單、免費、有效的解決方案是最好的選擇。✨



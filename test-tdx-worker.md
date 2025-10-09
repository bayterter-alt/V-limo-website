# 🧪 测试 TDX Worker

## 方法 1：使用浏览器测试

访问以下 URL（替换为您的 Worker URL）：

```
https://flight-api-tdx.您的用户名.workers.dev/?flight=BR189
```

**预期结果**：
- ✅ 如果成功，会显示航班 JSON 数据
- ❌ 如果失败，会显示错误信息

## 方法 2：使用命令行测试

```bash
curl "https://flight-api-tdx.您的用户名.workers.dev/?flight=BR189"
```

## 常见测试航班

可以尝试这些台湾常见航班：

- `BR189` - 长荣航空（香港 → 桃园）
- `CI835` - 中华航空（洛杉矶 → 桃园）
- `BR856` - 长荣航空（桃园 → 首尔）
- `CI160` - 中华航空（桃园 → 大阪）
- `JX800` - 星宇航空（桃园 → 东京）

## 成功的响应示例

```json
{
  "flightNumber": "BR189",
  "airline": "长荣航空",
  "status": "scheduled",
  "departure": {
    "airport": "香港国际机场",
    "iata": "HKG",
    "scheduled": "2024-01-15 08:00:00",
    ...
  },
  "arrival": {
    "airport": "台湾桃园国际机场",
    "iata": "TPE",
    "scheduled": "2024-01-15 09:45:00",
    ...
  }
}
```

## 错误排查

### 错误 1：401 Unauthorized

**原因**：API 凭证错误或环境变量未设置

**解决**：
1. 检查环境变量是否正确设置
2. 确认 Variable names 是 `TDX_ID` 和 `TDX_SECRET`
3. 重新部署 Worker

### 错误 2：404 Flight not found

**原因**：该航班今天可能没有班次

**解决**：尝试其他航班号

### 错误 3：500 Internal Server Error

**原因**：Worker 代码错误

**解决**：
1. 检查 Worker 代码是否完整复制
2. 查看 Worker 的 Logs 了解详细错误


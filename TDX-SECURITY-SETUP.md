# 🔒 TDX API 安全设置指南

如何安全地在 Cloudflare Worker 中使用 API 凭证

---

## ⚠️ **重要安全原则**

### **绝对不要做的事**

❌ **不要将 Client Secret 写在前端代码中**
```javascript
// ❌ 危险！任何人都能看到
const secret = 'your-secret-here';
```

❌ **不要将含有 Secret 的代码提交到 GitHub**
```bash
# ❌ 如果提交了包含 Secret 的文件，即使删除也能从历史记录中找到
git add flight-api-worker.js  # 如果包含明文 Secret
```

❌ **不要在 Worker 代码中硬编码敏感资讯**
```javascript
// ⚠️ 相对安全，但不是最佳实践
const TDX_CLIENT_SECRET = 'xxxxxxxx-xxxx-xxxx';
```

### **应该做的事**

✅ **使用 Cloudflare Worker 环境变量**
```javascript
// ✅ 最安全的方式
const TDX_CLIENT_SECRET = TDX_SECRET;
```

---

## 🛡️ **安全方案对比**

| 方案 | 安全性 | 易用性 | 推荐度 |
|------|--------|--------|--------|
| **前端代码** | ❌ 0/10 | ✅ 10/10 | ❌ 绝不推荐 |
| **Worker 硬编码** | ⚠️ 6/10 | ✅ 9/10 | ⚠️ 可接受但不理想 |
| **Worker 环境变量** | ✅ 10/10 | ✅ 8/10 | ✅ **强烈推荐** |
| **Cloudflare Secrets** | ✅ 10/10 | ✅ 8/10 | ✅ **最佳方案** |

---

## 📋 **方法 1：使用 Cloudflare Dashboard（推荐）**

### **步骤 1：登入 Cloudflare Dashboard**

1. 前往：https://dash.cloudflare.com/
2. 登入您的账号

### **步骤 2：进入 Worker 设置**

1. 点击左侧 **Workers & Pages**
2. 找到您的 Worker：`flight-api-tdx`
3. 点击 Worker 名称进入详情页

### **步骤 3：设置环境变量**

1. 点击 **Settings（设置）** 标签
2. 向下滚动找到 **Variables（变量）** 区块
3. 点击 **Add variable（添加变量）**

### **步骤 4：添加 Client ID**

| 字段 | 值 |
|------|-----|
| **Variable name** | `TDX_ID` |
| **Value** | `您的 TDX Client ID` |
| **Type** | ☐ Encrypt（不加密，ID 不敏感）|

点击 **Save（保存）**

### **步骤 5：添加 Client Secret**

| 字段 | 值 |
|------|-----|
| **Variable name** | `TDX_SECRET` |
| **Value** | `您的 TDX Client Secret` |
| **Type** | ☑️ **Encrypt（加密）** ← **重要！** |

点击 **Save（保存）**

### **步骤 6：重新部署 Worker**

1. 点击 **Deployments（部署）** 标签
2. 点击 **Create deployment（创建部署）**
3. 或者直接编辑代码后 **Save and Deploy**

---

## 🔧 **方法 2：使用 Wrangler CLI（进阶）**

### **步骤 1：安装 Wrangler**

```bash
npm install -g wrangler
```

### **步骤 2：登入 Cloudflare**

```bash
wrangler login
```

### **步骤 3：创建 wrangler.toml**

在项目根目录创建 `wrangler-tdx.toml`：

```toml
name = "flight-api-tdx"
main = "flight-api-tdx-worker.js"
compatibility_date = "2024-01-01"

# ⚠️ 不要在这里写 Secret！
# 使用下面的命令单独设置
```

### **步骤 4：设置环境变量（安全方式）**

```bash
# 设置 Client ID（不敏感）
wrangler secret put TDX_ID
# 然后输入您的 Client ID

# 设置 Client Secret（敏感，会加密）
wrangler secret put TDX_SECRET
# 然后输入您的 Client Secret
```

### **步骤 5：部署**

```bash
wrangler deploy --config wrangler-tdx.toml
```

---

## 🔐 **环境变量的工作原理**

### **在 Worker 中的使用**

更新后的代码：

```javascript
// ✅ 从环境变量读取（安全）
const TDX_CLIENT_ID = TDX_ID;
const TDX_CLIENT_SECRET = TDX_SECRET;
```

### **Cloudflare 如何保护您的 Secret**

1. **加密存储**
   - Secret 在 Cloudflare 的数据库中加密存储
   - 只在 Worker 运行时解密

2. **不会暴露在前端**
   - Worker 在服务器端运行
   - 用户无法看到环境变量

3. **访问控制**
   - 只有您的 Cloudflare 账号能查看
   - 即使在 Dashboard 也只显示 `[已加密]`

4. **代码可以公开**
   - Worker 代码可以安全地提交到 GitHub
   - 因为没有包含实际的 Secret

---

## 🚨 **如果您已经暴露了 Secret**

### **立即采取的行动**

#### **1. 如果提交到了 GitHub**

**步骤 A：撤销 TDX API 凭证**

1. 登入 TDX 平台：https://tdx.transportdata.tw/
2. 进入「会员中心」→「我的应用程式」
3. 删除旧的应用程式
4. 创建新的应用程式
5. 取得新的 Client ID 和 Client Secret

**步骤 B：清理 Git 历史记录**

⚠️ **警告**：这会改变 Git 历史，谨慎操作！

```bash
# 方法 1：使用 git filter-branch（复杂但彻底）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch flight-api-tdx-worker.js" \
  --prune-empty --tag-name-filter cat -- --all

# 方法 2：直接删除整个仓库并重新创建（简单）
# 1. 备份您的代码
# 2. 删除 GitHub 仓库
# 3. 创建新仓库
# 4. 提交干净的代码（使用环境变量）
```

**步骤 C：强制推送**

```bash
git push origin --force --all
```

#### **2. 如果只是在 Cloudflare Worker 中**

✅ **无需担心**
- Worker 代码不会暴露给用户
- 但仍建议改用环境变量

---

## ✅ **验证安全设置**

### **检查清单**

- [ ] Client Secret 已设置为环境变量
- [ ] 环境变量已启用「Encrypt（加密）」
- [ ] Worker 代码中没有硬编码 Secret
- [ ] Worker 已重新部署
- [ ] 测试查询功能正常
- [ ] 确认代码可以安全提交到 GitHub

### **测试步骤**

1. **部署后测试**
   ```bash
   curl "https://flight-api-tdx.您的用户名.workers.dev/?flight=BR189"
   ```
   
   应该返回航班资讯，而不是认证错误。

2. **查看 Dashboard**
   - 在 Variables 页面
   - `TDX_SECRET` 应该显示为 `[encrypted]`
   - 无法查看原始值（这是正确的！）

---

## 📝 **最佳实践总结**

### **开发流程**

```
1. 取得 TDX API 凭证
   ↓
2. 在 Cloudflare Dashboard 设置环境变量
   ↓
3. Worker 代码使用环境变量
   ↓
4. 代码可以安全地提交到 GitHub
   ↓
5. 团队成员只需设置自己的环境变量
```

### **代码管理**

✅ **可以提交到 GitHub 的文件**：
```
✅ flight-api-tdx-worker.js (使用环境变量版本)
✅ TDX-API-SETUP-GUIDE.md
✅ wrangler.toml (不包含 Secret)
✅ README.md
```

❌ **绝对不要提交的内容**：
```
❌ 包含实际 Client Secret 的任何文件
❌ .env 文件（如果包含真实凭证）
❌ 备份文件（如 worker.js.backup）
```

### **.gitignore 设置**

创建或更新 `.gitignore`：

```gitignore
# 环境变量文件
.env
.env.local
.env.*.local

# 备份文件
*.backup
*-backup.js

# 包含敏感资讯的配置
*-with-secrets.js
credentials.json
```

---

## 🔍 **常见问题**

### **Q1: 使用环境变量后，如何更新 Secret？**

**A**: 在 Cloudflare Dashboard 中：
1. 进入 Worker → Settings → Variables
2. 找到 `TDX_SECRET`
3. 点击「Edit（编辑）」
4. 输入新值
5. Save and Deploy

### **Q2: 团队成员如何使用？**

**A**: 每个团队成员：
1. 在自己的 Cloudflare 账号中设置环境变量
2. 使用相同的 Worker 代码
3. 不需要知道彼此的 Secret

### **Q3: 环境变量会增加成本吗？**

**A**: ✅ 完全免费！
- Cloudflare Workers 免费方案包含环境变量功能
- 无额外费用

### **Q4: 如何在本地测试？**

**A**: 使用 Wrangler 的 `.dev.vars` 文件：

1. 创建 `.dev.vars`（本地开发用）：
   ```
   TDX_ID=your-client-id
   TDX_SECRET=your-client-secret
   ```

2. 添加到 `.gitignore`：
   ```
   .dev.vars
   ```

3. 本地运行：
   ```bash
   wrangler dev
   ```

---

## 🎯 **推荐设置流程**

### **全新设置（推荐）**

1. ✅ 取得 TDX API 凭证
2. ✅ 使用更新后的 Worker 代码（已使用环境变量）
3. ✅ 在 Cloudflare Dashboard 设置环境变量
4. ✅ 部署 Worker
5. ✅ 测试功能
6. ✅ 安全地提交代码到 GitHub

### **已有硬编码 Secret（需要迁移）**

1. ⚠️ 立即从代码中删除硬编码的 Secret
2. ✅ 在 Cloudflare Dashboard 设置环境变量
3. ✅ 更新 Worker 代码使用环境变量
4. ✅ 重新部署
5. ✅ 如果已提交到 GitHub，考虑撤销旧凭证

---

## 📞 **需要帮助？**

如果在安全设置过程中遇到问题：
- 查看 Cloudflare Workers 官方文档：https://developers.cloudflare.com/workers/configuration/environment-variables/
- 随时询问我！

---

**记住：安全无小事！使用环境变量是保护 API 凭证的最佳方式。** 🔒✅


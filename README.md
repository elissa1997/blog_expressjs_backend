# blog_expressjs_backend

基于 `Node.js + Express + Prisma + MySQL + JWT` 的博客后端服务，包含用户认证、文章管理、评论管理、其他评论模块和字典管理模块。

## 技术栈

- Node.js
- Express 4
- Prisma ORM
- MySQL
- JWT（jsonwebtoken）
- bcryptjs

## 功能模块

- Auth
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/info`（需登录）
- Article
  - `GET /article/list`
  - `GET /article/detail`
  - `POST /article/add`（需登录）
  - `POST /article/update`（需登录）
  - `POST /article/delete`（需登录）
- Comment
  - `POST /comment/add`（含七牛文本审核）
  - `GET /comment/list`
  - `GET /comment/admin-list`（需登录）
  - `POST /comment/update`（需登录）
  - `POST /comment/delete`（需登录）
- OtherComment
  - `POST /othercomment/add`（含七牛文本审核）
  - `GET /othercomment/list`
  - `GET /othercomment/admin-list`（需登录）
  - `POST /othercomment/update`（需登录）
  - `POST /othercomment/delete`（需登录）
- Friendlink
  - `POST /friendlink/add`（游客提交，含七牛文本审核）
  - `GET /friendlink/list`（仅返回已通过链接）
  - `GET /friendlink/admin-list`（需登录）
  - `POST /friendlink/update`（需登录）
  - `POST /friendlink/delete`（需登录）
- Dict
  - `GET /dict/list`（需登录）
  - `GET /dict/findbytype`
  - `POST /dict/add`（需登录）
  - `POST /dict/update`（需登录）
  - `POST /dict/delete`（需登录）

## 目录结构

```text
.
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ app.js
│  ├─ config/
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ models/
│  ├─ routes/
│  ├─ services/
│  ├─ utils/
│  └─ validators/
├─ 接口.openapi.json
├─ database.md
└─ package.json
```

## 环境要求

- Node.js 18+（建议）
- MySQL 8+（建议）

## 安装与启动

1. 安装依赖

```bash
npm install
```

2. 配置服务参数

开发环境复制 `src/config/config.dev.example.js` 为 `src/config/config.dev.js`；生产环境复制
`src/config/config.prod.example.js` 为 `src/config/config.prod.js`。生产配置中的数据库和 JWT
可以通过 Compose 环境变量提供，七牛凭据直接填写在对应环境的 config 文件中。

可配置项包括：

- `port`：服务端口（默认 `3000`）
- `databaseUrl`：数据库连接地址；应用启动时会将其提供给 Prisma
- `trustProxy`：可信反向代理层数；本地直连设为 `false`，生产环境单层 Nginx 设为 `1`
- `rateLimit.enabled`：是否启用游客提交限流
- `rateLimit.comment`：评论和其他评论共享的限流窗口及次数
- `rateLimit.friendlink`：友情链接提交的限流窗口及次数
- `jwt.secret` / `jwt.expiresIn`：JWT 配置
- `qiniu.accessKey` / `qiniu.secretKey`：七牛内容审核。评论接口未配置时跳过审核；友情链接提交接口未配置时返回 `502` 且不入库。

使用 `docker-compose.example.yml` 部署时，应先复制为 `docker-compose.yml` 并填写其中的环境变量。

3. 生成 Prisma Client

应用运行时会从当前环境的 config 读取 `databaseUrl`，无需修改 `prisma/schema.prisma`。
Prisma CLI 不会加载应用 config，因此执行 CLI 命令时需要临时提供相同的 `DATABASE_URL`：

```bash
DATABASE_URL="mysql://user:password@localhost:3366/blog" npx prisma generate
```

PowerShell 可先执行：

```powershell
$env:DATABASE_URL="mysql://user:password@localhost:3366/blog"
npx prisma generate
```

4. 启动服务

```bash
npm start
```

启动后默认地址：`http://localhost:3000`

## 接口约定

- 鉴权头：

```http
Authorization: Bearer <token>
```

- 统一返回格式：

```json
{
  "msg": "success",
  "data": {},
  "status": 200
}
```

- 分页参数（常见列表接口）：
  - `offset`：页码（从 1 开始）
  - `limits`：每页条数

## 友情链接接口说明

- 游客提交字段：`name`（1-100 字符）和 `url`（仅支持 HTTP/HTTPS，最长 2048 字符）。
- 七牛文本审核结果为 `pass` 或 `review` 时入库，初始状态均为 `0`（待审核）；`block` 时拒绝入库。
- 状态值：`0` 待审核、`1` 已通过、`2` 已拒绝。
- 后台列表的 `search` 支持 `name`、`url`、`status`、`qiniuSuggestion`。
- `sort` 数值越大，公开列表中的排序越靠前。
- 七牛仅审核站点名称；URL 只进行 HTTP/HTTPS 格式校验和重复检查，不抓取目标网页。


## 开发说明

- 项目采用分层结构：`routes -> controllers -> services -> models`
- 数据库访问集中在 `models` 层（通过 Prisma）
- 全局中间件包括日志、统一响应和错误处理

# blog_expressjs_backend

基于 `Node.js + Express + Prisma + MySQL + JWT` 的博客后端服务，包含用户认证、文章管理、评论管理、友情链接和字典管理模块。

## 技术栈

- Node.js
- Express 4
- Prisma ORM
- MySQL
- JWT（jsonwebtoken）
- bcryptjs

## 功能模块

- Auth
  - `POST /auth/login`
  - `GET /auth/info`（需登录）
- User（均需管理员权限）
  - `GET /user/list`
  - `GET /user/detail`
  - `POST /user/add`
  - `POST /user/update`
  - `POST /user/delete`
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

## 配置加载流程

- 未设置 `NODE_ENV` 时默认加载 `src/config/config.dev.js`。
- `NODE_ENV=production` 时加载 `src/config/config.prod.js`。
- `src/config/db.js` 在加载 Prisma Client 前读取当前 config 的 `databaseUrl`，并在外部未设置
  `DATABASE_URL` 时将其提供给 Prisma。
- JWT、七牛和限流等其他配置由对应模块直接从当前 config 读取。

主要配置项包括：

- `port`：服务端口（默认 `3000`）
- `databaseUrl`：数据库连接地址
- `trustProxy`：可信反向代理层数；本地直连设为 `false`，生产环境单层 Nginx 设为 `1`
- `rateLimit.enabled`：是否启用游客提交限流
- `rateLimit.comment`：评论提交的限流窗口及次数
- `rateLimit.friendlink`：友情链接提交的限流窗口及次数
- `jwt.secret` / `jwt.expiresIn`：JWT 配置
- `qiniu.accessKey` / `qiniu.secretKey`：七牛内容审核。评论接口未配置时跳过审核；友情链接提交接口未配置时返回 `502` 且不入库。

## 本地开发

1. 复制 `src/config/config.dev.example.js` 为 `src/config/config.dev.js`，并填写开发环境配置。
2. 执行 `npm install`。`@prisma/client` 的安装钩子会自动生成 Prisma Client，无需设置临时数据库地址。
3. 后续修改 `prisma/schema.prisma` 时，直接执行 `npx prisma generate` 重新生成 Client。
4. 执行 `npm start` 启动服务，默认地址为 `http://localhost:3000`。

Windows 下重新生成 Client 前应先停止正在运行的 Node 服务，避免查询引擎 DLL 被占用。

## Docker 部署

1. 复制 `src/config/config.prod.example.js` 为 `src/config/config.prod.js`，并填写生产环境配置。
2. 复制 `docker-compose.example.yml` 为 `docker-compose.yml`。
3. 执行 `docker compose up -d --build` 构建并启动服务。

Dockerfile 安装依赖时项目 Schema 尚未复制进镜像，因此会在复制源码后显式执行
`npx prisma generate`。生成阶段不连接数据库，也不需要 `DATABASE_URL`；容器启动后，Compose
设置的 `NODE_ENV=production` 会让应用加载生产 config，数据库模块再将其中的 `databaseUrl`
提供给 Prisma。

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

## 用户管理接口说明

- 所有用户管理接口都需要 Bearer Token，且数据库中的当前用户必须为 `admin=1`。
- 新增用户字段：`name`、`password`、`email`、`admin`；`admin` 必须由调用方明确传 `0` 或 `1`。
- 更新用户时 `id` 必填，`name`、`password`、`email`、`admin` 至少传一个。
- 删除用户时 `id` 为整数数组，且不允许删除当前登录用户。
- 列表的 `search` 可传普通关键词（同时匹配用户名和邮箱），也可传 JSON 字符串并按 `name`、`email`、`admin` 筛选。
- 密码写入前使用 bcrypt 哈希，用户接口不会返回密码字段。

## 友情链接接口说明

- 游客提交字段：`name`（1-100 字符）和 `url`。URL 必须是 `https://主域名/` 或 `https://二级域名/` 形式，不允许端口、路径、查询参数或锚点。
- 七牛文本审核结果为 `pass` 或 `review` 时入库，初始状态均为 `0`（待审核）；`block` 时拒绝入库。
- 状态值：`0` 待审核、`1` 已通过、`2` 已拒绝。
- 后台列表的 `search` 支持 `name`、`url`、`status`、`qiniuSuggestion`。
- `sort` 数值越大，公开列表中的排序越靠前。
- 七牛仅审核站点名称；URL 只进行 HTTPS 根域名格式校验和重复检查，不抓取目标网页。


## 开发说明

- 项目采用分层结构：`routes -> controllers -> services -> models`
- 数据库访问集中在 `models` 层（通过 Prisma）
- 全局中间件包括日志、统一响应和错误处理

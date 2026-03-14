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

2. 配置数据库连接

编辑 `prisma/schema.prisma` 中 `datasource db.url`，例如：

```prisma
datasource db {
  provider = "mysql"
  url      = "mysql://root:password@localhost:3306/blog"
}
```

3. 生成 Prisma Client

```bash
npx prisma generate
```

4. 配置服务参数

编辑 `src/config/index.js`：

- `port`：服务端口（默认 `3000`）
- `jwt.secret` / `jwt.expiresIn`：JWT 配置
- `qiniu.accessKey` / `qiniu.secretKey`：七牛内容审核（可留空，留空则自动跳过审核）

5. 启动服务

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


## 开发说明

- 项目采用分层结构：`routes -> controllers -> services -> models`
- 数据库访问集中在 `models` 层（通过 Prisma）
- 全局中间件包括日志、统一响应和错误处理


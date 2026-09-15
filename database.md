# 数据库文档（基于当前 prisma/schema.prisma）

## 概览
- 数据库：MySQL
- ORM：Prisma
- 表数量：5（article、comment、dict、friendlink、user）

## 表：article
| 字段 | 类型 | 主键 | 非空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | Int | 是 | 是 | autoincrement() | 文章 ID |
| title | String | 否 | 是 | "unknow" | 标题 |
| cover | String? | 否 | 否 | 无 | 封面 URL |
| content | String(@db.Text) | 否 | 是 | 无 | 内容 |
| category | Int | 否 | 是 | 0 | 分类 |
| status | Int | 否 | 是 | 0 | 状态 |
| createdAt | DateTime | 否 | 是 | now() | 创建时间 |
| updatedAt | DateTime | 否 | 是 | 无 | 更新时间 |

关系：
- article(1) -> comment(n)，外键 `comment.a_id -> article.id`
- 删除 article 时，comment 级联删除（onDelete: Cascade）

## 表：comment
| 字段 | 类型 | 主键 | 非空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | Int | 是 | 是 | autoincrement() | 评论 ID |
| a_id | Int | 否 | 是 | 无 | 所属文章 ID |
| parent_id | Int? | 否 | 否 | 无 | 父评论 ID（自关联） |
| is_regist | Int | 否 | 是 | 0 | 是否注册用户 |
| user_name | String | 否 | 是 | "unknow" | 用户名 |
| email | String | 否 | 是 | "unknow" | 邮箱 |
| url | String? | 否 | 否 | 无 | URL |
| ip | String | 否 | 是 | "127.0.0.1" | IP |
| text | String?(@db.Text) | 否 | 否 | 无 | 评论内容 |
| status | Int | 否 | 是 | 0 | 状态 |
| createdAt | DateTime | 否 | 是 | now() | 创建时间 |
| updatedAt | DateTime | 否 | 是 | 无 | 更新时间 |
| agent | String | 否 | 是 | "unknow" | UA |
| qiniuSuggestion | String(@db.VarChar(16)) | 否 | 是 | "pass" | 七牛文本审核结果（pass/review/block） |

索引与关系：
- 索引：`@@index([a_id], map: "comment_a_id_fkey")`
- 外键：`a_id -> article.id`（级联删除）
- 自关联：`parent_id -> comment.id`（级联删除）

## 表：dict
| 字段 | 类型 | 主键 | 非空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | Int | 是 | 是 | autoincrement() | 字典项 ID |
| dict_type | String | 否 | 是 | "unknow" | 字典分组 |
| name | String | 否 | 是 | "unknow" | 展示名称 |
| value | String(@db.VarChar(191)) | 否 | 是 | "0" | 字典值（字符串） |
| createdAt | DateTime | 否 | 是 | now() | 创建时间 |
| updatedAt | DateTime | 否 | 是 | 无 | 更新时间 |

## 表：user
| 字段 | 类型 | 主键 | 非空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | Int | 是 | 是 | autoincrement() | 用户 ID |
| name | String | 否 | 是 | 无 | 用户名（唯一） |
| password | String | 否 | 是 | 无 | 密码哈希 |
| email | String | 否 | 是 | 无 | 邮箱（唯一） |
| role | String(@db.VarChar(191)) | 否 | 是 | "1" | 角色值（`"1"` 为管理员） |
| createdAt | DateTime | 否 | 是 | now() | 创建时间 |
| updatedAt | DateTime | 否 | 是 | 无 | 更新时间 |

唯一约束：
- `user.name` 唯一
- `user.email` 唯一

## 表：friendlink
| 字段 | 类型 | 主键 | 非空 | 默认值 | 说明 |
|---|---|---|---|---|---|
| id | Int | 是 | 是 | autoincrement() | 友情链接 ID |
| name | String(@db.VarChar(100)) | 否 | 是 | 无 | 站点名称 |
| url | String(@db.VarChar(2048)) | 否 | 是 | 无 | 规范化后的站点 URL |
| urlHash | String(@db.Char(64)) | 否 | 是 | 无 | URL SHA-256 唯一摘要 |
| status | Int | 否 | 是 | 0 | 0 待审核、1 已通过、2 已拒绝 |
| qiniuSuggestion | String(@db.VarChar(16)) | 否 | 是 | 无 | 七牛文本审核结果 |
| sort | Int | 否 | 是 | 0 | 展示排序，数值越大越靠前 |
| ip | String(@db.VarChar(45)) | 否 | 是 | "127.0.0.1" | 提交者 IP |
| agent | String(@db.VarChar(512)) | 否 | 是 | "unknow" | 提交者 UA |
| createdAt | DateTime | 否 | 是 | now() | 创建时间 |
| updatedAt | DateTime | 否 | 是 | @updatedAt | 更新时间 |

索引：
- `urlHash` 唯一索引，用于防止规范化后的 URL 重复提交。
- `(status, sort)` 普通索引，用于公开列表查询和排序。

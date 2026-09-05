# MiniMall Server

MiniMall 迷你商城的后端服务，基于 Node.js + Express + MySQL，为前端提供商品、订单、用户鉴权等 REST API。

前端仓库：[mini-mall-frontend](https://github.com/hgao2930-cloud/mini-mall-frontend)

## 技术栈

- Node.js + Express：RESTful API
- MySQL 8：users / products / orders 三张表
- JWT 登录鉴权：token 写入 **httpOnly cookie**（SameSite=Lax，防 XSS）
- bcrypt 密码加密存储
- PM2 进程守护（生产环境）

## 功能与设计要点

- **注册 / 登录**：bcrypt 加密，登录签发 JWT 并写入 httpOnly cookie；登出接口清除 cookie
- **订单归属用户**：所有订单接口通过鉴权中间件拿到 `req.userId`，只能操作自己的订单
- **订单状态机在服务端校验**：`待付款 → 待收货 → 已完成`，非法流转直接 400
- **下单金额服务端计算**：不信任前端传来的总价，按商品表价格 × 数量服务端核算
- **商品快照服务端生成**：订单中的商品名称/价格/图片由数据库拼装，防止客户端造假
- **401 统一处理**：前端收到 401 后自动跳转登录页

## API 一览

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| POST | `/api/auth/register` | 注册（bcrypt 加密） | 否 |
| POST | `/api/auth/login` | 登录，签发 JWT 并写入 cookie | 否 |
| POST | `/api/auth/logout` | 登出，清除 cookie | 否 |
| GET | `/api/products` | 商品列表 | 否 |
| GET | `/api/products/:id` | 商品详情 | 否 |
| GET | `/api/orders` | 我的订单 | 是 |
| POST | `/api/orders` | 提交订单（金额/快照服务端核算） | 是 |
| PATCH | `/api/orders/:id` | 订单状态流转 | 是 |
| GET | `/api/profile` | 收货信息 | 是 |
| PUT | `/api/profile` | 保存收货信息 | 是 |

## 本地启动

前置要求：Node.js 22+、MySQL 8。

```bash
# 1. 初始化数据库（建库建表 + 30 条商品种子数据）
mysql -u root -p --default-character-set=utf8mb4 < schema.sql

# 2. 配置环境变量
cp .env.example .env
#    填写 DB_PASSWORD / JWT_SECRET

# 3. 安装依赖并启动
npm install
npm run dev
```

## 目录结构

```
├── schema.sql          # 建库建表 + 种子数据
├── .env.example        # 环境变量模板
└── src/
    ├── index.js        # 启动入口
    ├── app.js          # Express 应用与中间件
    ├── db.js           # MySQL 连接池
    ├── middleware/
    │   └── auth.js     # JWT 鉴权中间件
    └── routes/         # auth / products / orders / profile
```

## 生产部署

Node 进程使用 PM2 守护：

```bash
npm install -g pm2
pm2 start src/index.js --name mini-mall-api
pm2 save
```

前端构建产物由 Nginx 托管，`/api` 反向代理到本服务（见前端仓库部署文档）。

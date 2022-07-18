---
title: express.js使用redis存储session
tags:
  - JavaScript
  - express.js
  - Redis
  - Session
  - Web
  - Node.js
categories:
  - - Node.js
    - 框架
    - Web
    - express.js
    - Session
date: 2022-07-18 17:48:47
---


该文章不讨论怎么搭建redis-server，只讨论如何在express.js框架中使用redis-server来存储session。

## 创建App

1. 创建app目录

```bash
mkdir my_redis_session_app
cd my_redis_session_app
```

2. 初始化app，生成package.json

```bash
# 根据提示一步步进行下去就可以了
npm init
```

## 创建express App

```bash
npm install express --no-save

# 适用于Node.js 8.2.0之后版本，如果未安装express-generator会提示安装
# 根据提示进行下去
npx express-generator

# 适用于旧版本Node.js
npm install -g express-generator
express --view=pug my_redis_session_app
```

```bash
# 安装并更新依赖
npm install

npm install express-session
npm install redis@3.1.2 connect-redis
npm install uuid # 用于生成session id
```

生成的目录结构大体如下：

```
.
├── app.js
├── bin
│   └── www
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug
```

## 配置secret环境变量

文章中的测试环境使用docker-compose，这在environment中配置SESSION_SECRET环境变量。

测试时可以用以下这种方式来启动服务

```bash
SESSION_SECRET=<secret> npm start
```

## 使用redis store

以下修改都在app.js中

### 导包

```javascript
const session = require('express-session');
const redis = require('redis');
const redisStore = require('connect-redis')(session);
const { v4: uuidv4 } = require('uuid')
```

### 登记redis session

可以在app.js的这行代码（大概在app.js的25行左右）

```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

后加入以下内容：

```javascript
app.use(session({
  genid: (req) => {
    return uuidv4()
  },
  name: '<根据实际填写>',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new redisStore({
    client: redis.createClient({
      host: '<根据实际填写>',
      port: 6379,
      ttl: 86400,
      no_ready_check: true,
    }),
  }),
}));
```


---
title: Push Docker Image
tags:
  - Docker
  - Image
  - Push
categories:
  - - Docker
    - Image
date: 2022-07-15 16:57:40
---


1. 登录

```bash
docker login
```

2. 给Image的tag加上个人docker账户的前缀

```bash
docker tag lcserver phantom27/lcserver
```

3. 推送

```bash
docker push phantom27/lcserver
```


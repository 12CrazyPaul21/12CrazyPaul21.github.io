---
title: 配置Alpine的apk国内镜像源
tags:
  - Alpine
  - Mirror
  - 镜像源
  - Snippet
categories:
  - - Linux
    - 发行版
    - Alpine
    - Mirror
date: 2022-07-19 16:04:15
---


```bash
sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
```
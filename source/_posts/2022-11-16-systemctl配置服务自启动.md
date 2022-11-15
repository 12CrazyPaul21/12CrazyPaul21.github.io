---
title: systemctl配置服务自启动
tags:
  - systemctl
  - daemon
  - 自启动
  - RHEL
  - CentOS
  - Snippet
categories:
  - - Linux
    - Command
    - Service
date: 2022-11-16 01:06:27
---


```bash
# 开启服务自启动
sudo systemctl enable docker

# 关闭服务自启动
sudo systemctl disable docker
```


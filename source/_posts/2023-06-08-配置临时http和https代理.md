---
title: 配置临时http和https代理
tags:
  - Snippet
  - Proxy
  - 代理
  - Linux
categories:
  - - Linux
    - Proxy
  - - Windows
    - 网络
    - 代理
date: 2023-06-08 09:34:38
---


```bash
# bash
export http_proxy='http://127.0.0.1:23457'
export https_proxy='http://127.0.0.1:23457'

# powershell
$env:http_proxy='http://127.0.0.1:23457'
$env:https_proxy='http://127.0.0.1:23457'
```



> 对于http_proxy和https_proxy环境变量无效，并且不提供指定proxy参数的命令，可以使用**proxychains**工具。
>
> **proxychains**需要配置**/etc/proxychains4.conf**文件



```ini
# /etc/proxychains4.conf配置例子
# ...省略

# 避免环回地址走代理，如果有其它地址需要排除的也可以用类似的写法
localnet 127.0.0.0/255.0.0.0
localnet ::1/128

[ProxyList]
# socks4  proxy.example.com 1080
# socks5  proxy.example.com 9050
http    proxy.example.com 8080
```


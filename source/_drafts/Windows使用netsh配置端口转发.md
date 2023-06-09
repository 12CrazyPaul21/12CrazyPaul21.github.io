---
title: Windows使用netsh配置端口转发
tags:
  - Windows
  - netsh
  - 端口转发
  - Snippet
categories:
  - - Windows
    - 网络
    - 端口转发
---



```powershell
# 登记ipv4 to ipv4的端口转发
netsh interface portproxy add v4tov4 listenaddress='0.0.0.0' listenport=9999 connectaddress='127.0.0.1' connectport=9880

# 查看条目
netsh interface portproxy show v4tov4

# 删除条目
netsh interface portproxy delete v4tov4 listenaddress='0.0.0.0' listenport=9999
```


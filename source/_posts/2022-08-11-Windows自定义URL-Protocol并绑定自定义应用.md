---
title: Windows自定义URL Protocol并绑定自定义应用
tags:
  - Windows
  - URL Protocol
  - Schema
  - 浏览器
  - Browser
  - Snippet
categories:
  - - Windows
    - Network
    - URL Protocol
date: 2022-08-11 13:58:41
---


## 实现方法

```bat
# 协议名为xcmd，关联应用cmd.exe
[HKEY_CLASSES_ROOT\xcmd]
"URL Protocol"="cmd.exe"

[HKEY_CLASSES_ROOT\xcmd\Shell]

[HKEY_CLASSES_ROOT\xcmd\Shell\Open]
@=""

# 协议访问启动命令
[HKEY_CLASSES_ROOT\xcmd\Shell\Open\Command]
@="\"cmd.exe\" /k echo %1"
```

## 浏览器上看到的效果

![](/images/post/windows_custom_url_protocol/custom_url_protocol_effect_1.png)

![](/images/post/windows_custom_url_protocol/custom_url_protocol_effect_2.png)

![](/images/post/windows_custom_url_protocol/custom_url_protocol_effect_3.png)
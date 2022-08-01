---
title: 通过vbs以隐藏方式启动bat或console程序
tags:
  - Windows
  - Console Porgram
  - Bat
  - VBScript
  - 运维
  - Command
  - 命令
  - Snippet
categories:
  - - Windows
    - VBScript
    - Shell
date: 2018-05-02 15:13:30
---


```vbscript
CreateObject("WScript.Shell").Run """<program/bat>.<exe/bat>""", 0, False
```


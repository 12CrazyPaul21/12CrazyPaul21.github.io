---
title: meson在setup时指定cpu架构位数
tags:
  - cpu
  - meson
  - build
  - snippet
categories:
  - - 构建工具
    - meson
    - setup
date: 2022-09-22 15:12:19
---


> Intel 32架构使用x86，64位使用x86_64

## powershell

```powershell
$Env:PROCESSOR_ARCHITEW6432 = 'x86'
meson setup build
```

## cmd

```bash
set PROCESSOR_ARCHITEW6432=x86
meson setup build
```

## bash

```bash
PROCESSOR_ARCHITEW6432=x86 meson setup build
```


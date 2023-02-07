---
title: pipreqs导出python项目依赖
tags:
  - Python
  - pipreqs
  - requirements
  - Snippet
categories:
  - - Python
    - 依赖处理
date: 2023-02-07 14:02:34
---


```bash
# 兼容gbk与utf8的做法
# --print or --savepath=<filepath>
pipreqs ./ --encoding='iso-8859-1' --print
```


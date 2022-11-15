---
title: Python List利用迭代器逐个遍历并在超出范围后提供默认值的简约做法
tags:
  - Python
  - Snippet
  - Iterator
  - List
  - 迭代器
categories:
  - - Python
    - List
date: 2022-11-15 15:24:04
---


```python
l = iter('00:32'.split(':'))

next(l, 0)
# 输出: '00'

next(l, 0)
# 输出: '32'

next(l, 0)
# 输出: 0
```


---
title: Python注册Windows SEH过滤器，捕获SEH异常
tags:
  - Python
  - Snippet
  - Windows SEH
categories:
  - - Python
    - 异常处理
date: 2023-03-14 10:06:01
---


```python
import ctypes

@ctypes.WINFUNCTYPE(ctypes.wintypes.LONG, ctypes.c_void_p)
def windows_seh_dummy_handler(exception_info_pointer):
    return 1 # EXCEPTION_EXECUTE_HANDLER

ctypes.windll.kernel32.SetUnhandledExceptionFilter(windows_seh_dummy_handler)
```


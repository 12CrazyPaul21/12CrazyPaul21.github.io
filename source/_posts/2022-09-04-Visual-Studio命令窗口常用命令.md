---
title: Visual Studio命令窗口常用命令
tags:
  - Snippet
  - Visual Studio
  - Command Window
date: 2022-09-04 20:36:33
---


> 官方文档：[Visual Studio命令](https://docs.microsoft.com/zh-cn/visualstudio/ide/reference/visual-studio-commands?view=vs-2022)

- 执行Shell命令：`Tools.Shell [/command] [/output] [/dir:folder]  path [args]` 
- 启动调试：`Debug.Start [address]`
- 列出模块：`Debug.ListModuels`
- 列出线程：`Debug.ListThreads [index]`
- 快速监视：`Debug.QuickWatch`
- 监视：`Debug.Watch[index]`，index需要跟在Watch后面，并且为整数
- 新建文件：`File.NewFile [filename] [/t:templatename] [/editor:editorname]`
- 列出源：`Debug.ListSource [/Count:number] [/Current] [/File:filename] [/Line:number] [/ShowLineNumbers:yes|no]`
- 列出内存：`Debug.ListMemory [/ANSI|Unicode] [/Count:number] [/Format:formattype] [/Hex|Signed|Unsigned] [expression]`
- 列出调用堆栈：`Debug.ListCallStack`
- 列出反汇编：`Debug.ListDiassembly`


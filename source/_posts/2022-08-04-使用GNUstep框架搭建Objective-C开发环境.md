---
title: 使用GNUstep框架搭建Objective-C开发环境
tags:
  - GNUstep
  - Objective-C
  - Debain
  - GNUmakefile
  - AppKit
  - Foundation
  - OSX
  - 环境搭建
  - Snippet
categories:
  - - Objective-C
    - GNUstep
    - 环境搭建
date: 2022-08-04 16:35:01
---


这里使用的环境是Kali，同类型的其它Debian发行版照样适用。

GNUstep官方网站：[GNUstep.org](http://gnustep.org/)

GNUstep官方文档：[GNUstep Developer Guides](http://wiki.gnustep.org/index.php/Developer_Guides)

Apple AppKit框架开发文档：[AppKit Framework](https://developer.apple.com/documentation/appkit?language=objc)

Apple Foundation框架开发文档：[Foundation Framework](https://developer.apple.com/documentation/foundation?language=objc)

## 关于GNUstep

GNUstep是OpenStep的GNU开源版本，它有四个核心部分：

- GNUstep Make：即GNUmakefile，提供类似Makefile的功能
- GNUstep Base：提供OpenStep的Foundation框架
- GNUstep GUI：提供OpenStep的AppKit框架，包含图形界面相关的接口
- GNUstep Back：提供与操作系统相关的backend处理

## 安装依赖

```bash
# 安装objective-c GNU编译器
sudo apt install gobjc gobjc++
```

```bash
# 安装GNUstep环境、开发包以及GUI接口
sudo apt-get install gnustep gnustep-devel libgnustep-gui-dev
```

## 搭建项目

详细说明可以参考官方文档：[Building Your First Objective-C Program](http://www.gnustep.org/resources/documentation/Developer/Base/ProgrammingManual/manual_1.html#What-is-GNUstep_003f)

### 初始化GNUstep开发环境

```bash
# 不同环境，GNUstep.sh的位置可能不一样
source /usr/share/GNUstep/Makefiles/GNUstep.sh
```

### 编写GNUmakefile

```makefile
include $(GNUSTEP_MAKEFILES)/common.make

APP_NAME = TGUI
TGUI_OBJCC_FILES = main.mm

include $(GNUSTEP_MAKEFILES)/application.make
```

### main.mm

```objective-c
#include <Foundation/Foundation.h>
#include <AppKit/AppKit.h>

int main(int argc, char* argv[])
{
    NSApplication *app = [NSApplication sharedApplication];
    NSWindow *window = [[NSWindow alloc] init];

    NSLog(@"TGUI is running\n");
    [app setDelegate: window];
    [app run];

    return 0;
}
```

### 构建并运行

```bash
make
openapp ./TGUI.app
```


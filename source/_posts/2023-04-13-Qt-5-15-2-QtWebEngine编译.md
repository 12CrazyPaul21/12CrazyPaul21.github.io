---
title: Qt-5.15.2- QtWebEngine编译
tags:
  - Qt
  - QtWebEngine
  - compile
  - cross compile
  - ninja
  - nmake
categories:
  - - Qt
    - QtWebEngine
date: 2023-04-13 14:13:04
---


## 重新编译QWebEngine

因为腾讯的WebRTC需要h264解码，官方的QWebEngine默认是没有启用的，所以需要用`-webengine-proprietary-codecs`开关重新编译QWebEngine

https://doc.qt.io/qt-5/qtwebengine-features.html#audio-and-video-codecs

## 确定PyQt版本

比如目前用的是5.15.2，需要更新打包环境的相关包：

```bash
pip install PyQt5==5.15.2
pip install PyQt5-Qt5==5.15.2
pip install PyQt5-sip==12.12.0
pip install PyQt5-stubs==5.15.2.0
pip install PyQtWebEngine==5.15.2
pip install PyQtWebEngine-Qt5==5.15.2
```

## 安装编译环境依赖

### 1. 安装qt framework and tool

5.15.2是没有官方离线包的，所以只能通过官方的安装工具来下载，选择以下组件（Sources必须选择，因为编译需要源码）

\ Qt 5.15.2

​	\ MSVC 2019 32-bit

​	\ Sources

​	\ Qt WebEngine

\ Developer and Designer Tools

​	\ Ninja 1.10.2

### 2. 安装vs2019

### 3. 安装python 2.7.5

https://www.python.org/downloads/release/python-275/

编译QWebEngine依赖python2，这里装32位或64位的都可以

**注意：**

1. 装完之后把python安装目录和它的Scripts目录加进`PATH`环境变量
2. python最好跟qt安装在同一个盘，不然在编译的时候会出现切换目录失败

## 编译

只需要单独编译QWebEngine模块，其它Qt模块不需要

### 1. 创建build目录

最好跟qt安装在同一个盘，不然也会有奇怪的问题

### 2. 确定路径（根据实际修改）

build目录：D:\build

qmake路径：D:\Qt\5.15.2\msvc2019\bin\qmake.exe

QWebEngine源码路径：D:\Qt\5.15.2\Src\qtwebengine

vc x64_x86 交叉编译prompt路径："C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Auxiliary\Build\vcvarsamd64_x86.bat"

**注意：**QWebEngine这里必须用x64_x86交叉编译环境来编译

### 3. 进入构建目录

```bash
pushd D:\build
%comspec% /k "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Auxiliary\Build\vcvarsamd64_x86.bat"
```

### 4. configure

```bash
D:\Qt\5.15.2\msvc2019\bin\qmake D:\Qt\5.15.2\Src\qtwebengine -- -webengine-proprietary-codecs
```

**注意：**

1. 如果失败，在调整环境之后，需要删除`config.cache`文件再重新执行，否则会使用之前记录的环境
2. 确保Qt WebEngineCore下面的WebRTC是yes

### 5. make

```bash
nmake
```

### 6. *注意项

在编译的时候会出现一些报错，需要不断的打补丁，在修改的时候尽量别改ninja或者其它make文件，否则默认会重头开始编译

#### a. 打印报错方法

在停下来的时候，打开`D:\build\src\core\ninja_wrapper.bat`

在`ninja.exe` 后面补充`-v`和`-j1`参数（在稳定编译之后可以ctrl+c暂停，然后把-j1去掉，恢复多线程编译），`-v`是为了让ninja把报错信息输出来，`-j1`是因为默认是多线程编译，这样影响报错打印的位置

```bat
@echo off
SetLocal EnableDelayedExpansion
if defined PATH (
    set PATH=D:\Qt\5.15.2\Src\gnuwin32\bin;!PATH!
) else (
    set PATH=D:\Qt\5.15.2\Src\gnuwin32\bin
)
D:\build\src\3rdparty\ninja\ninja.exe -v -j1 %*
EndLocal
```

#### b. 修改代码导致的报错

这种错误在加了`-v`之后都能输出来，根据实际请求，手动修改qwebengine代码然后重新`nmake`

#### c. 相对路径导致的报错

比如出现以下文件找不到

```
../../../../Qt/5.15.2/Src/qtwebengine/src/3rdparty/chromium/third_party/blink/renderer/core/precompile_core.h
```

用vscode打开build目录，全局搜索并替换成绝对路径

```
D:/Qt/5.15.2/Src/qtwebengine/src/3rdparty/chromium/third_party/blink/renderer/core/precompile_core.h
```

## 输出

编译的输出包括：

**D:\build\bin**

```
Qt5WebEngine.dll
Qt5WebEngineCore.dll
Qt5WebEngineWidgets.dll
QtWebEngineProcess.exe
```

把它们拷贝到打包环境仓库的bin32目录下

**D:\build\src\core\release**

```
# 这部分如果不更新的话，devtool用不了
icudtl.dat
qtwebengine_devtools_resources.pak
qtwebengine_resources.pak
qtwebengine_resources_100p.pak
qtwebengine_resources_200p.pak
```

把它们拷贝到打包环境仓库的bin32\PyQt5\Qt\resources目录下（如果目录不存在就直接新建）
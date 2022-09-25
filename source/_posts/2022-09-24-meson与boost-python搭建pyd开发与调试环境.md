---
title: meson与boost::python搭建pyd开发与调试环境
tags:
  - Python
  - pyd
  - boost::python
  - meson
  - Snippet
categories:
  - - Python
    - pyd
date: 2022-09-24 21:48:59
---

## Python与boost::python相关文档

- [Boost.Python](https://www.boost.org/doc/libs/1_45_0/libs/python/doc/index.html)
- [Boost.Python WiKi](https://wiki.python.org/moin/boost.python)
- [Boost.Python Example](https://github.com/boostorg/python/tree/develop/example)
- [Boost.Python Test Cases](https://github.com/boostorg/python/tree/develop/test)
- [Python/C API 参考手册](https://docs.python.org/zh-cn/3/c-api/index.html)
- [扩展和嵌入 Python 解释器](https://docs.python.org/zh-cn/3/extending/index.html)

## 搭建基础环境

这里说明的是在Windows环境下的Visual Studio开发32位的pyd模块，并且Python、boost::python都是采用/MT（即使是在Debug构建模式下）的静态链接。

> 之所以在Debug构建模式也采用/MT，是因为boost::python模块的一些Assert在32位的Debug构建模式下会失败，目前发现的是与对齐相关的一些断言

### 安装Python 3.x

安装32位的Python并且把其安装目录添加到`PATH`环境变量中

### 安装meson

最好使用pip来安装meson，这样可以方便meson处理Python的依赖

```bash
pip install meson
```

### 构建Boost::python模块

为了使Boost::python匹配当前版本的Python，必须重新构建。

到以下链接（[boost-binaries](https://sourceforge.net/projects/boost/files/boost-binaries/)）下载Boost预编译安装包，并切到其安装目录执行以下命令进行构造：

```bash
.\bootstrap.bat
.\b2.exe --with-python stage --stagedir="./bin/" address-model=32 link=static runtime-link=static
```

## 编写meson.build

```javascript
project('Demo', 'cpp',
        version : '0.1',
        default_options : [
            'warning_level=3',
            'cpp_std=c++14',
            'b_vscrt=mt',
            'backend_startup_project=Demo'
        ]
)

buildtype = get_option('buildtype')
project_version = meson.project_version()
project_root = meson.current_source_dir()
project_build_root = meson.current_build_dir()
source_root = join_paths(project_root, 'src')
include_root = join_paths(project_root, 'src')
tests_root = join_paths(project_root, 'tests')

#
# Compiler Flags
#

add_global_arguments(['/Zi'], language: 'cpp')
add_global_link_arguments(['/DEBUG:FULL'], language: 'cpp')

#
# Dependencies
#

python3_dep = dependency('python3', version: '>=3.7.0')
boost_python_dep = dependency('boost', modules: ['python3'], static: true)

#
# Define Demo Project
#

Demo_inc = [
    include_root
]

Demo_inc_files = files([
    join_paths(include_root, 'Demo.h')
])

Demo_src_files = files([
    join_paths(include_root, 'Demo.cc')
])

Demo_deps = [
    python3_dep,
    boost_python_dep
]

shared_library(
    'Demo',
    [
        Demo_inc_files,
        Demo_src_files
    ],
    include_directories: Demo_inc,
    dependencies: Demo_deps,
    name_suffix: 'pyd',
    install: false
)

configure_file(
    input: '@0@@sha.vcxproj.user.in'.format(meson.project_name()),
    output: '@0@@sha.vcxproj.user'.format(meson.project_name()),
    configuration : configuration_data({
        'PYTHON_FULL_PATH': find_program('python').full_path()
    })
)

#
# Test
#

subdir('tests')
```

## 编写Demo代码

`src/Demo.h`：

```c
#ifndef __DEMO_H
#define __DEMO_H

#define BOOST_PYTHON_STATIC_LIB

#include <boost/python.hpp>

#endif  // #ifndef __DEMO_H
```

`src/Demo.cc`：

```c++
#include <Demo.h>

int foo()
{
    return 250;
}

using namespace boost::python;

BOOST_PYTHON_MODULE(Demo)
{
    def("foo", foo);
}
```

## 编写Python测试用例

`tests/meson.build`：

```javascript
test('DemoTest',
    find_program('python'),
    args: [join_paths(meson.current_source_dir(), 'DemoTest.py')],
    verbose: true,
    workdir: project_build_root,
    env: {
        'PYTHONPATH': project_build_root
    }
)
```

`tests/DemoTest.py`：

```python
import logging
import unittest
import Demo

class DemoTestCase(unittest.TestCase):
    logging.basicConfig(level=logging.INFO)

    @classmethod
    def setUpClass(cls):
        return super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        return super().tearDownClass()

    def test_foo(self):
        self.assertEqual(Demo.foo(), 250)

suite = unittest.TestSuite()
loader = unittest.TestLoader()
suite.addTest(loader.loadTestsFromTestCase(DemoTestCase))
test_result = unittest.TextTestRunner().run(suite)
exit(len(test_result.errors) + len(test_result.failures))
```

## 在Visual Studio中的调试方法

在项目主`meson.build`中有下面这段指令：

```javascript
configure_file(
    input: '@0@@sha.vcxproj.user.in'.format(meson.project_name()),
    output: '@0@@sha.vcxproj.user'.format(meson.project_name()),
    configuration : configuration_data({
        'PYTHON_FULL_PATH': find_program('python').full_path()
    })
)
```

我们可以创建一个`Demo@sha.vcxproj.user.in`文件作为模板，在meson执行configure的时候把内容输出到构建目录下，让Visual Studio使用我们自定义的调试参数。

`Demo@sha.vcxproj.user.in`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="Current" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup Condition="'$(Configuration)|$(Platform)'=='debug|Win32'">
    <DebuggerFlavor>WindowsLocalDebugger</DebuggerFlavor>
    <LocalDebuggerCommandArguments>-i -c "print('&gt;&gt;&gt; import Demo'); import Demo"</LocalDebuggerCommandArguments>
    <LocalDebuggerCommand>@PYTHON_FULL_PATH@</LocalDebuggerCommand>
    <LocalDebuggerWorkingDirectory>$(OutDirFullPath)</LocalDebuggerWorkingDirectory>
    <LocalDebuggerEnvironment>PYTHONPATH=$(OutDirFullPath)</LocalDebuggerEnvironment>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)|$(Platform)'=='release|Win32'">
    <DebuggerFlavor>WindowsLocalDebugger</DebuggerFlavor>
    <LocalDebuggerCommandArguments>-i -c "print('&gt;&gt;&gt; import Demo'); import Demo"</LocalDebuggerCommandArguments>
    <LocalDebuggerCommand>@PYTHON_FULL_PATH@</LocalDebuggerCommand>
    <LocalDebuggerWorkingDirectory>$(OutDirFullPath)</LocalDebuggerWorkingDirectory>
    <LocalDebuggerEnvironment>PYTHONPATH=$(OutDirFullPath)</LocalDebuggerEnvironment>
  </PropertyGroup>
</Project>
```

## 配置环境变量

```powershell
# powershell
$Env:PROCESSOR_ARCHITEW6432 = 'x86'
$Env:BOOST_INCLUDEDIR = "<替换为Boost include目录>"
$Env:BOOST_LIBRARYDIR = "<替换为Boost lib目录>"

# or cmd
set PROCESSOR_ARCHITEW6432=x86
set BOOST_INCLUDEDIR=<替换为Boost include目录>
set BOOST_LIBRARYDIR=<替换为Boost lib目录>
```

## 执行configure

```powershell
# release模式
meson setup build/vsrelease --backend=vs --buildtype=release

# debug模式
meson setup build/vsdebug --backend=vs --buildtype=debug
```

## 构建

```powershell
# release模式
meson compile -C build/vsrelease

# debug模式
meson compile -C build/vsdebug
```

## 执行测试用例

```powershell
# release模式
meson test -C build/vsrelease

# debug模式
meson test -C build/vsdebug
```


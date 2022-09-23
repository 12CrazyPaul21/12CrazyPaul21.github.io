---
title: meson自定义Visual Studio Backend的调试器参数
tags:
  - meson
  - Visual Studio
  - Debugger
  - snippet
categories:
  - - 构建工具
    - meson
    - backend
    - Visual Studio
date: 2022-09-24 00:22:31
---


Visual Studio C/C++解决方案的`<项目名>.@sha.vcxproj.user`文件可以存储调试器的配置，可以利用`configure_file`，在meson执行configure时输出自定义的`vcxproj.user`文件。

> [meson configure_file()](https://mesonbuild.com/Reference-manual_functions.html#configure_file)

这里以使用Python本机调试器为例子：

`FooBar@sha.vcxproj.user.in`文件：

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="Current" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup Condition="'$(Configuration)|$(Platform)'=='debug|Win32'">
    <DebuggerFlavor>PythonDebugLaunchProvider</DebuggerFlavor>
    <LocalDebuggerCommandArguments>-i -c "print('&gt;&gt;&gt; import FooBar'); import FooBar"</LocalDebuggerCommandArguments>
    <LocalDebuggerCommand>@PYTHON_FULL_PATH@</LocalDebuggerCommand>
    <LocalDebuggerWorkingDirectory>$(OutDirFullPath)</LocalDebuggerWorkingDirectory>
    <LocalDebuggerEnvironment>PYTHONPATH=$(OutDirFullPath)</LocalDebuggerEnvironment>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)|$(Platform)'=='release|Win32'">
    <DebuggerFlavor>PythonDebugLaunchProvider</DebuggerFlavor>
    <LocalDebuggerCommandArguments>-i -c "print('&gt;&gt;&gt; import FooBar'); import FooBar"</LocalDebuggerCommandArguments>
    <LocalDebuggerCommand>@PYTHON_FULL_PATH@</LocalDebuggerCommand>
    <LocalDebuggerWorkingDirectory>$(OutDirFullPath)</LocalDebuggerWorkingDirectory>
    <LocalDebuggerEnvironment>PYTHONPATH=$(OutDirFullPath)</LocalDebuggerEnvironment>
  </PropertyGroup>
</Project>
```

`meson.build`部分内容：

```javascript
configure_file(
    input: '@0@@sha.vcxproj.user.in'.format(meson.project_name()),
    output: '@0@@sha.vcxproj.user'.format(meson.project_name()),
    configuration : configuration_data({
        'PYTHON_FULL_PATH': find_program('python').full_path()
    })
)
```


---
title: hexo以树结构打印category列表
tags:
  - Hexo
  - Snippet
  - 树
  - 层级
  - Category
categories:
  - - Hexo
    - Category
date: 2023-08-19 18:21:52
---


`Hexo` 可以使用以下命令打印所有的 `category`以及其所关联的文章数目，但是并不支持以层级结构打印 `category` 之间的关系。



```bash
hexo list category
```



可以根据  [Hexo官方API文档](https://hexo.io/zh-cn/api/)，编写脚本来扩展这个需求：



```javascript
const Hexo = require('hexo');

const build_category_tree = (categories, parent='') => {
    let {filtered: sub_categories, excluded: remain} = categories.reduce(
        (result, category) => {
            if ('parent' in category && category['parent'] != parent) {
                result.excluded.push(category);
            } else {
                result.filtered.push(category);
            }
            return result;
        },
        {filtered: [], excluded: []}
    );

    sub_categories.sort((l, r) => {
        if (l.name < r.name) {
            return -1;
        } else if (l.name > r.name) {
            return 1;
        } else {
            return 0;
        }
    });

    return sub_categories.map(category => {
        return {
            name: category.name,
            subs: build_category_tree(remain, category._id)
        }
    });
};

const show_category_tree = (category_tree, prefix='') => {
    category_tree.forEach(item => {
        console.log(prefix + '|-' + item.name);
        show_category_tree(item.subs, prefix + '|  ');
    });
};

(async function() {
    let hexo = new Hexo(process.cwd(), {});

    await hexo.init();
    await hexo.load();

    show_category_tree(build_category_tree(hexo.locals.get('categories').toArray()));
})();
```



该脚本打印的样式如下：



```bash
|-Algorithm
|  |-Smooth
|-C
|  |-Attribute
|  |-宏
|  |  |-函数签名
|  |-性能优化
|-C++
|  |-Attribute
|  |-宏
|  |  |-函数签名
|  |-性能优化
|  |-编码规范
|  |-编码风格
|-CI/CD
|  |-Github Actions
|-Chrome
|  |-Plugin
|-Clang-Format
|  |-C++
|-Database
|  |-Mysql
|  |  |-Table
|-DirectX
|  |-坐标系
|-Docker
|  |-Image
|  |-Mirror
|  |-Volume
|  |  |-Bind Mount
|-FFmpeg
|  |-动画拼接
|-Hack
|  |-Game
|  |  |-Mod
|  |  |  |-Elden Ring
|-Hexo
|  |-Category
|  |-Deploy
|  |-Draft
|  |-Markdown
|  |  |-Footnote
|  |-Page
|-Hook
|  |-frida
|-Linux
|  |-Command
|  |  |-File System
|  |  |-Service
|  |-Kernel
|  |  |-性能优化
|  |-Proxy
|  |-包管理工具
|  |  |-yum
|  |-发行版
|  |  |-Alpine
|  |  |  |-Mirror
|  |-命令
|  |  |-运维相关
|  |-源码阅读
|  |  |-源码目录结构
|  |-网络
|  |  |-防火墙
|-Lua
|  |-C++
|  |-Plugin
|-Mac OS
|  |-包管理器
|  |  |-brew
|  |  |  |-FAQ
|  |-服务
|  |  |-ssh
|-Node.js
|  |-Npm
|  |  |-Mirror
|  |-框架
|  |  |-Web
|  |  |  |-express.js
|  |  |  |  |-Session
|-Objective-C
|  |-GNUstep
|  |  |-环境搭建
|-Python
|  |-List
|  |-pyd
|  |  |-boost::python
|  |  |  |-callback
|  |-依赖处理
|  |-字符串处理
|  |-异常处理
|-Qt
|  |-QtWebEngine
|-Skia
|  |-编译
|-Visual Studio
|  |-Command Window
|  |-Python
|  |  |-pyd
|-Windows
|  |-Explorer
|  |-Network
|  |  |-URL Protocol
|  |-PE
|  |-VBScript
|  |  |-Shell
|  |-文件共享
|  |-网络
|  |  |-代理
|  |  |-屏蔽端口
|  |  |-端口转发
|-apt
|-golang
|  |-mirror
|-shellcode
|  |-shell
|-windows
|  |-安全
|  |  |-勒索病毒
|-微服务
|  |-容错机制
|-构建工具
|  |-meson
|  |  |-backend
|  |  |  |-Visual Studio
|  |  |-custom target
|  |  |-setup
|-版本控制
|  |-Git
|  |  |-Bug定位
|  |  |-Commit
|  |  |-Config
|  |  |-Conflict
|  |  |-Git Flow
|  |  |-Merge
|  |  |-Push
|  |-版本号
|-虚拟化
|  |-网络配置
|-软件工程
|-软件破解
|-运维
|-逆向分析
|-项目日志
|  |-Link-Cooperation
|  |  |-敏捷过程
```


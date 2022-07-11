---
title: Commit Message规范记录
date: 2020-07-17 18:23:08
tags:
 - Git
 - 最佳实践
 - Commit Message
category:
 - [Git, 版本控制]
---
## commit message规范
&emsp;参考angular的commit格式
### 格式
```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>

<类型>(<可选作用域>): <标题描述>
<空一行>
<正文>
<空一行>
<脚注>
```
### type
&emsp;描述提交的类型
```
feat:     增加新功能(feature)
fix:      修复bug

docs:     只改动了文档相关的内容
style:    不影响代码含义的改动，例如去掉空格、改变缩进、增删分号
build:    构造工具的或者外部依赖的改动，例如webpack，npm
refactor: 代码重构时使用
revert:   执行git revert打印的message

test:     添加测试或者修改现有测试
perf:     提高性能的改动
ci:       与CI（持续集成服务）有关的改动
chore:    不修改src或者test的其余修改，例如构建过程或辅助工具的变动
```
### scope
&emsp;描述提交影响的作用域，可使用项目名或者模块名等
### subject
&emsp;提交消息的标题
### body
&emsp;正文体
### footer
&emsp;脚注，包含Breaking Changes和Affect issues。
#### Breaking Changes
&emsp;breaking change即可能会产生破坏性的重要改变，比如接口改变、与上个版本不兼容等，需要在Footer以BREAKING CHANGE:开头，后面加上对变动的描述、以及变动理由和迁移方法等信息。
&emsp;例子：
```
BREAKING CHANGE: refactor to use JavaScript features not available in Node 6.
```
#### Affect issues
&emsp;针对某些issue进行描述，这里的使用与托管的平台有关。比如：[github关于issue的规范](https://docs.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue)。
&emsp;模式：
```
KEYWORD #ISSUE-NUMBER
```
&emsp;例子：
```
修复issue
Fix #200

关闭issue
Close #300

解决issue
resolve #400
re #500
```
### 关于撤销操作(revert)
&emsp;描述撤销操作提交时使用以下格式(其中的hash是被撤销的commit的hash)：
```
revert: <subject>
This reverts commit <hash>
```
### 完整例子
```
fet(ui): 创建一个窗口

创建hello world窗口,并修改一个bug

BREAKING CHANGE: 把subsystem从console改为了window，程序入口改变了

resolve #760

```
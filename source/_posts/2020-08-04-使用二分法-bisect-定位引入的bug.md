---
title: 使用二分法(bisect)定位引入的bug
date: 2020-08-04 18:24:12
tags:
 - Git
 - 最佳实践
 - 版本控制
 - Bug定位
category:
 - [Git, 版本控制, Bug定位]
---
### 使用二分法(bisect)定位引入的bug

#### 情景模拟准备
仓库中有一个record.txt文本文件,如果有一行的文本为"有bug"表示存在bug。已知其中一个正常提交的commit id是902c829f42b14d547330519993674e7f909a73a4，引入bug提交的commit id是98068739138d5785f2186d37efdfadfe9b5ebf1d。

#### 名词定义
 bad：存在bug的提交

 good：无bug的提交

#### 做法1
 1. 开始进入二分法定位bug时需要指定一个已知存在bug(bad)与无bug(good)的提交
 2. 初始化并进入二分操作
``` bash
# start后参数为空表示已知的bad和good提交在后续标记
git bisect start
```
 3. 标记一个good的提交
``` bash
git bisect good 902c829f42b14d547330519993674e7f909a73a4
```
 4. 标记当前commit存在bug,这时会采用二分法跳到good与bad中间的commit
``` bash
git bisect bad
```
 5. 经过上面标记完成后,二分法定位bug正式开始.到了下一个commit,需要检查该提交是否存在bug,然后完成标记或者跳过该提交
``` bash
# 如果当前commit存在bug则标记为bad
git bisect bad

# 如果当前commit无bug则标记为good
git bisect good

# 跳过该提交则执行skip
git bisect skip
```
 6. 执行上面操作之后都会定位到下一个commit,重复操作直到定位到bug,git会给出首次引入bug的commit的提示的
 7. bug定位完成后退出二分查找
``` bash
git bisect reset
```
#### 做法2
 1. 在初始化时标记一个bad提交和一个good提交
``` bash
# git bisect start <bad> <good>
git bisect start head 902c829f42b14d547330519993674e7f909a73a4
```
 2. 剩下的做法与做法1相同
 
#### 做法3(使用图形化)
 1. 初始化
``` bash
git bisect start head 902c829f42b14d547330519993674e7f909a73a4
```
 2. 进入图形化操作
``` bash
git bisect visualize
```

#### 做法4(使用脚本让git自动完成定位)
 1. 编写一个可以检查bug的脚本,脚本返回0表示无bug,返回其它任意值表示存在bug,例如：
``` bash
# file: check
#!/bin/sh
! grep -q "有bug" record.txt
```
 2. 开始执行二分法定位bug
``` bash
git bisect start head 902c829f42b14d547330519993674e7f909a73a4
git bisect run ./check 
```

#### 查看日志
``` bash
git bisect log
```

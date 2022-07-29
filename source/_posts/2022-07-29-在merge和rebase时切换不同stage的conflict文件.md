---
title: 在merge和rebase时切换不同stage的conflict文件
tags:
  - Git
  - Conflict
  - Merge
  - Rebase
  - Unmerged paths
  - Check out
  - Snippet
categories:
  - - 版本控制
    - Git
    - Conflict
date: 2022-07-29 10:54:11
---


当执行merge或rebase，发生冲突时，可以用git-checkout子命令来切换不同stage版本的冲突文件。

切换“源”版本：

```bash
git checkout --ours ./
# or
git checkout --ours <文件路径>
```

切换为“merge/rebase目标”版本：

```bash
git checkout --theirs ./
# or
git checkout --theirs <文件路径>
```


---
title: 替换Git仓库所有提交的author和committer信息
tags:
  - Git
  - Commit Message
  - 修改提交信息
categories:
  - - 版本控制
    - Git
    - Commit
date: 2022-07-14 18:01:40
---


使用filter-branch子命令来实现替换author和committer的name和email信息

例子：

```bash
git filter-branch --env-filter '
	if test "$GIT_AUTHOR_EMAIL" = "<替换为原email>"
	then
        GIT_AUTHOR_NAME=<替换为新username>
		GIT_AUTHOR_EMAIL=<替换为新email>
	fi
	if test "$GIT_COMMITTER_EMAIL" = "<替换为原email>"
	then
        GIT_COMMITTER_NAME=<替换为新username>
		GIT_COMMITTER_EMAIL=<替换为新email>
	fi
' -- --all
```

如果提示如下信息：

```bash
Cannot create a new backup.
A previous backup already exists in refs/original/
Force overwriting the backup with -f
```

可以加入-f参数强制执行

```bash
git filter-branch -f --env-filter '
	if test "$GIT_AUTHOR_EMAIL" = "<替换为原email>"
	then
        GIT_AUTHOR_NAME=<替换为新username>
		GIT_AUTHOR_EMAIL=<替换为新email>
	fi
	if test "$GIT_COMMITTER_EMAIL" = "<替换为原email>"
	then
        GIT_COMMITTER_NAME=<替换为新username>
		GIT_COMMITTER_EMAIL=<替换为新email>
	fi
' -- --all
```

filter-branch的详细说明可以直接看帮助文档

```bash
git filter-branch --help
```

用以下命令检查更新后的author和commiter信息

```bash
git log --pretty=full
```

然后就可以把修改强制提交到远程仓库了（推送时需要注意远程仓库的分支安全保护策略）

```bash
git push origin --force --all
```


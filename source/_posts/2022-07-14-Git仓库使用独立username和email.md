---
title: Git仓库使用独立username和email
tags:
  - Git
  - Snippet
  - Config
categories:
  - - 版本控制
    - Git
    - Config
date: 2022-07-14 17:09:05
---


打开仓库中的.git/config文件，修改[user]节中的name和email，例如：

```ini
[user]
	name = phantom
[user]
	email = 604916833@qq.com
```

保存后可以在仓库中执行下面命令来看是否生效

```bash
git config user.name
git config user.email
```


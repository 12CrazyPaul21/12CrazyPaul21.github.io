---
title: hexo使用Github Actions作为CI/CD
tags:
  - CI/CD
  - 持续集成与持续部署
  - Hexo
  - Github Actions
categories:
  - - Hexo
    - Deploy
  - - CI/CD
    - Github Actions
date: 2022-08-03 11:48:19
---


由于Travis CI开始收费，现在转为使用Github Actions来自动化部署Github Page，目前Github Actions对于Public仓库是免费的。Github Actions的官方文档可看：[Github Actions Docs](https://docs.github.com/cn/actions)。

## 生成Github "Personal access tokens"

用于在hexo部署时向Github仓库推送消息。

跳转到Github以下页面：

**`Profile`** > **`Settings`** > **`Developer Settings`** > **`Personal access tokens`**

点击**`Generate new token`**创建一个token，可以把**`Expiration`**调整为**`No expiration`**，对于**`scopes`**根据实际需要来调整。

生成token之后把它拷贝记录下来，因为它只会显示一次。

## 添加仓库Action secret

这是为了能在Action执行时以安全的方式获取先前生成的`Personal access token`。

跳转到Github仓库以下页面：

**`Settings`** > **`Secrets`** > **`Actions`**

点击**`New repository secret`**创建一个secret

名字使用`PAGE_PUBLISH_TOKEN`，值使用上一步生成的`Personal access token`。

## 安装hexo deployer git依赖

```bash
npm install hexo-deployer-git --save
```

## 修改hexo配置

```yml
# file: _config.yml
# ...

deploy:
  type: git
  repo: https://PAGE_PUBLISH_TOKEN@github.com/<github账户名>/<github page仓库名>.git
  branch: gh-pages # 根据实际情况修改

# ...
```

## 创建workflow

在仓库以下路径

`./.github/workflows/`

存放所有的workflow，每一个workflow独立一个yml文件。

在这里创建一个`publish-github-page.yml`文件，内容如下：

```yml
name: Publish Github Page

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  deployment:
    runs-on: ubuntu-20.04
    steps:
      - name: Git checkout
        uses: actions/checkout@v2

      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '12.x'

      - name: Config environment
        env:
          PAGE_PUBLISH_TOKEN: ${{ secrets.PAGE_PUBLISH_TOKEN }}
          PUBLISH_NAME: 'bot'
          PUBLISH_MAIL: '604916833@qq.com'
        run: |
          git config --global user.name $PUBLISH_NAME
          git config --global user.email $PUBLISH_MAIL
          sed -i "s/PAGE_PUBLISH_TOKEN/$PAGE_PUBLISH_TOKEN/g" ./_config.yml

      - name: Install dependencies
        run: |
          npm install hexo-cli -g
          npm install

      - name: Generate hexo static page
        run: |
          hexo clean
          hexo generate

      - name: Deploy hexo static page
        run: hexo deploy
```

### 说明

`runs-on`指示deployment这个job运行的环境，这里是`ubuntu-20.04`，注意最好别用`ubuntu-latest`这样带latest的环境，可能会在启动环境时非常的慢。

`steps`是一个数组，存放所有的动作，每个元素可以用`name`来自定义名字。

其中`uses`可以指示从某处执行一系列的actions，可以通过`with`携带一系列参数。例如：

```yml
uses: actions/checkout@v2
```

这里的actions/checkout指的是https://github.com/actions/checkout仓库，@v2指的是仓库中v2这个tag，这个action的作用是把仓库（这里指的就是Github page的仓库）checkout到工作空间中。
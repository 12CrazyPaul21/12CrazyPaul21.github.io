---
title: hexo启用categories和tags页面
tags:
 - hexo
 - next
categories:
 - [hexo, page]
---

## 启用categories（分类）页面

1. 创建categories page

```bash
hexo new page "categories"
```

​	这会在./source创建一个categories的页目录

2. 编辑./source/categories/index.md

```markdown
---
title: categories
date: 2022-07-12 10:08:04
type: "categories"
comments: true
---
```

​	其中的关键是type属性

3. 修改主题配置（这里以next主题为例）

​	编辑./themes/next/_config.yml，把menu下的categories注释取消掉

```markdown
menu:
  home: / || fa fa-home
  #about: /about/ || fa fa-user
  #tags: /tags/ || fa fa-tags
  categories: /categories/ || fa fa-th
  archives: /archives/ || fa fa-archive
  #schedule: /schedule/ || fa fa-calendar
  #sitemap: /sitemap.xml || fa fa-sitemap
  #commonweal: /404/ || fa fa-heartbeat
```

4. 需要注意的是，category是有层级关系的，而tag没有，所以在文章中指定category要注意顺序

## 启用tags（标签）页面

1. 创建tags page

```bash
hexo new page "tags"
```

​	这同样会在./source创建一个tags的页目录

2. 编辑./source/tags/index.md

```markdown
---
title: tags
date: 2022-07-12 10:15:48
type: "tags"
comments: true
---
```

3. 修改主题配置（这里以next主题为例）

​	编辑./themes/next/_config.yml，把menu下的tags注释取消掉

```markdown
menu:
  home: / || fa fa-home
  #about: /about/ || fa fa-user
  tags: /tags/ || fa fa-tags
  categories: /categories/ || fa fa-th
  archives: /archives/ || fa fa-archive
  #schedule: /schedule/ || fa fa-calendar
  #sitemap: /sitemap.xml || fa fa-sitemap
  #commonweal: /404/ || fa fa-heartbeat
```

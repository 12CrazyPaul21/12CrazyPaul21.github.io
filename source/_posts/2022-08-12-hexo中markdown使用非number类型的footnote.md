---
title: Hexo中Markdown使用非number类型的footnote
tags:
  - Hexo
  - Markdown
  - Footnote
categories:
  - - Hexo
    - Markdown
    - Footnote
date: 2022-08-12 17:08:56
---


使用[hexo-footnote](https://github.com/guorant/hexo-footnote)扩展

## 安装hexo-footnote扩展

```bash
npm install hexo-footnote --save
```

## 配置hexo-footnote扩展

在`_config.yml`文件中补充扩展说明：

```yaml
plugins:
  - hexo-footnote
```

修改扩展配置：

```yaml
footnote:
  location_target_class: location-target
```

## 使用语法

```markdown
basic footnote[^1]
here is an inline footnote[^2](inline footnote)
and another one[^3]
and another one[^demo]

[^1]: basic footnote content
[^3]: paragraph
footnote
content
[^demo]: footnote content with some [markdown](https://en.wikipedia.org/wiki/Markdown)
```

例子：[^imfootnote]

[^imfootnote]: 这是一个脚注
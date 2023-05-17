---
title: ffmpeg将多张图片拼接成gif
tags:
  - FFmpeg
  - Snippet
  - Gif
  - Png
  - Animation
categories:
  - - FFmpeg
    - 动画拼接
date: 2023-05-17 17:45:45
---




```bash
# 这里把多张图片生成一张gif，每张图片之间的间隔是3秒

# 生成gif调色板，需要注意gif的调色板最多只支持256种颜色，所以细节丢失时避不可免
ffmpeg -framerate 1/3 -i %d.png -filter_complex "palettegen=max_colors=256:reserve_transparent=0" palette.png

# 拼接gif
ffmpeg -framerate 1/3 -i %d.png -i palette.png -lavfi "paletteuse,setpts=1.5*PTS" -loop 0 -b:v 0 -map_metadata -1 output.gif

```


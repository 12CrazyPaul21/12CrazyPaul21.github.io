---
title: JavaScript Trick记录
tags:
  - JavaScript
  - Trick
  - Snippet
categories:
  - - JavaScript
    - Trick
date: 2018-05-03 18:45:26
---




> 这篇文章会随时更新

## 将一个对象返回值直接解包

```javascript
const fn = () => {
    return {
        one: 1,
        two: 2
    }
};

let {one: var_one, two: var_two} = fn();

console.log(var_one);
console.log(var_two);
```



## 将一个Array根据条件拆分为多份

```javascript
let arr = [1, 2, 3];
let {a1: a1, a2: a2, a3: a3} = arr.reduce((res, item) = > {
	if (item == 1) res.a1.push(item);
	if (item == 2) res.a2.push(item);
	if (item == 3) res.a3.push(item);
	
	// 注意：需要把累积的结果返回
	return res;
}, {a1: [], a2: [], a3: []});
```


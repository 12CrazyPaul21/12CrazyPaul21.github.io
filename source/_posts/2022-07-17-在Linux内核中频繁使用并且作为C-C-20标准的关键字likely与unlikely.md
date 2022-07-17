---
title: 在Linux内核中频繁使用并且作为C/C++20标准的关键字likely与unlikely
tags:
  - Linux
  - Linux内核
  - 分支预测优化
  - 性能优化
  - C/C++关键字
  - C/C++ Attribute
  - gcc
  - objdump
  - Assembly
  - 汇编
categories:
  - - Linux
    - Kernel
    - 性能优化
  - - C
    - Attribute
  - - C++
    - Attribute
  - - C
    - 性能优化
  - - C++
    - 性能优化
date: 2022-07-17 22:22:40
---


## likely和unlikely的用途

对于条件选择语句，gcc内建了一条指令（**__builtin_expect**）用于优化，在一个条件经常出现，或者该条件很少出现的时候，编译器可根据这条指令对**条件分支选择**进行**优化**。

在Linux内核中把这条指令封装成了likely和unlikely宏，广泛用于**条件分支选择**语句上。

## gcc生效条件

如果想要**__builtin_expect**这条指令起作用的话，最起码要O2的优化级别

```bash
gcc -O2 ...
```

## 使用方法

```c
// 普通条件分支选择语句
if (a) {
    // ...
} else {
    // ...
}

// likely，判断为a在大多数情况下为真
if (likely(a)) {
    // ...
} else {
    // ...
}

// unlikely，判断为a在大多数情况下为假
if (unlikely(a)) {
    // ...
} else {
    // ...
}
```

## 实现原理

likely和unlikely在linux内核源码上其实就是宏，它们封装了__builtin_expect指令

```c++
#define likely(x) __builtin_expect(!!(x), 1)
#define unlikely(x) __builtin_expect(!!(x), 0)
```

__builtin_expect是gcc内建的一个“函数”，它的原型如下：

```c++
long __builtin_expect (long exp, long c)
```

!!(x)是为了把完整的x表达式转化为逻辑1或者0，__builtin_expect的作用就是表明期望exp与c相等，它的返回值是exp表达式逻辑值的本身。

### 分析汇编实现

想知道**__builtin_expect**指令是怎么实现的，最直观的方法就是看生成出来的汇编指令是怎样的，以下面这几部分代码生成汇编指令分析，使用的gcc版本为12.1.0（不同版本可能得到的指令不同）。

### 无优化的普通条件分支

```c++
// 无优化的普通条件分支
int func(int a)
{
    // 使用volatile是为了避免v被优化掉，之后的likely和unlikely例子中同样使用volatile
    volatile int v = 0;
    
    if (a > 0xF) {
        v = 0xF1;
    } else {
        v = 0xD4;
    }

    return v;
}
```

```bash
# 禁用优化
gcc func.c -m32 -g -O0 -c
# 这里采用英特尔的汇编语法
objdump -M intel -d func.o
```

```assembly
Disassembly of section .text:

00000000 <func>:
   0:   55                      push   ebp
   1:   89 e5                   mov    ebp,esp
   3:   83 ec 10                sub    esp,0x10
   6:   c7 45 fc 00 00 00 00    mov    DWORD PTR [ebp-0x4],0x0  ; int v = 0
   d:   83 7d 08 0f             cmp    DWORD PTR [ebp+0x8],0xf  ; if (v > 0xF)
  11:   7e 09                   jle    1c <func+0x1c>
  13:   c7 45 fc f1 00 00 00    mov    DWORD PTR [ebp-0x4],0xf1 ; v = 0xF1
  1a:   eb 07                   jmp    23 <func+0x23>
  1c:   c7 45 fc d4 00 00 00    mov    DWORD PTR [ebp-0x4],0xd4 ; v = 0xD4
  23:   8b 45 fc                mov    eax,DWORD PTR [ebp-0x4]
  26:   c9                      leave
  27:   c3                      ret                             ; return v
```

### 使用likely的条件分支

```c++
int func_with_likely(int a)
{
    volatile int v = 0;

    // 使用likely，并确定a > 0xF这个条件在大多数情况下都成立
    if (likely(a > 0xF)) {
        v = 0xF1;
    } else {
        v = 0xD4;
    }

    return v;
}
```

```bash
# 最起码要使用O2优化等级
gcc func_with_likely.c -m32 -g -O2 -c
objdump -M intel -d func_with_likely.o
```

```asm
Disassembly of section .text:

00000000 <func_with_likely>:
   0:   83 ec 10                sub    esp,0x10
   3:   83 7c 24 14 0f          cmp    DWORD PTR [esp+0x14],0xf    ; if (likely(a > 0xF))
   8:   c7 44 24 0c 00 00 00    mov    DWORD PTR [esp+0xc],0x0     ; int v = 0
   f:   00
  10:   7e 16                   jle    28 <func_with_likely+0x28>
  12:   c7 44 24 0c f1 00 00    mov    DWORD PTR [esp+0xc],0xf1    ; v = 0xF1
  19:   00
  1a:   8b 44 24 0c             mov    eax,DWORD PTR [esp+0xc]
  1e:   83 c4 10                add    esp,0x10
  21:   c3                      ret                                ; return v
  22:   8d b6 00 00 00 00       lea    esi,[esi+0x0]
  28:   c7 44 24 0c d4 00 00    mov    DWORD PTR [esp+0xc],0xd4    ; v = 0xD4
  2f:   00
  30:   8b 44 24 0c             mov    eax,DWORD PTR [esp+0xc]
  34:   83 c4 10                add    esp,0x10
  37:   c3                      ret                                ; return v
```

### 使用unlikely的条件分支

```c++
int func_with_unlikely(int a)
{
    volatile int v = 0;

    // 使用likely，并确定a > 0xF这个条件在大多数情况下都不成立
    if (unlikely(a > 0xF)) {
        v = 0xF1;
    } else {
        v = 0xD4;
    }

    return v;
}
```

```bash
# 最起码要使用O2优化等级
gcc func_with_unlikely.c -m32 -g -O2 -c
objdump -M intel -d func_with_unlikely.o
```

```asm
Disassembly of section .text:

00000000 <func_with_unlikely>:
   0:   83 ec 10                sub    esp,0x10
   3:   83 7c 24 14 0f          cmp    DWORD PTR [esp+0x14],0xf  ; if (unlikely(a > 0xF))
   8:   c7 44 24 0c 00 00 00    mov    DWORD PTR [esp+0xc],0x0   ; int v = 0
   f:   00
  10:   7f 16                   jg     28 <func_with_unlikely+0x28>
  12:   c7 44 24 0c d4 00 00    mov    DWORD PTR [esp+0xc],0xd4  ; v = 0xD4
  19:   00
  1a:   8b 44 24 0c             mov    eax,DWORD PTR [esp+0xc]
  1e:   83 c4 10                add    esp,0x10
  21:   c3                      ret                              ; return v
  22:   8d b6 00 00 00 00       lea    esi,[esi+0x0]
  28:   c7 44 24 0c f1 00 00    mov    DWORD PTR [esp+0xc],0xf1  ; v = 0xF1
  2f:   00
  30:   8b 44 24 0c             mov    eax,DWORD PTR [esp+0xc]
  34:   83 c4 10                add    esp,0x10
  37:   c3                      ret                              ; return v
```

### 结合分析汇编层实现原理

结合上面三段代码生成的汇编指令（分别是未优化、使用likely以及使用unlikely），可以得到__builtin_expect的实现方式。

- 把**更可能到达的分支的指令放在前面**，以**减少**到达分支入口所需的**跳转开销**（使用likely时主分支部分指令放在前面，使用unlikely时else分支部分指令放在前面）
  - likely使用的条件跳转指令为**（C层上）条件不成立时才跳转**（比如该likely例子中`a > 0xF`为主分支，它适配的跳转指令是`jg`，而else分支，适配的跳转指令是`jle`），这里采用的跳转指令就是`jle`。
  - unlikely使用的条件跳转指令为**（C层上）条件成立时才跳转**（比如该unlikely例子中`a > 0xF`为主分支，它适配的跳转指令是`jg`，而else分支，适配的跳转指令是`jle`），这里采用的跳转指令就是`jg`。
- **增加**各分支之后**有逻辑的冗余指令**，以**减少跳转开销**（其中一个分支跳转到后续逻辑）和**增加指令高速缓存命中率**（针对需要跳转到后续逻辑的那个分支，可以理解为相对未优化前预读取了后续逻辑的指令），这里存在一定的限制，缓存的大小受限于CPU的缓存大小（L1、L2、L3...），另外如果后续逻辑非常的大，照理来说编译器（看具体实现）也不会绝对这么去做。

## 优化原理

主要这三点：

1. 减少跳转指令带来的开销
2. 增加CPU高速缓存命中率（主要针对机器指令）
3. 提高CPU分支预测的准确性，从而减少CPU流水线分支预测错误带来的性能开销

### 增加CPU高速缓存命中率

CPU在读取指令时，是尝试从高速缓存一层层的命中测试最终直到内存的（L1->L2->L3->...->内存），比如说如果在L3中命中了，那么就可以直接使用而不需要再到内存上读取。

缓存越往后，速度越慢，如果在CPU读取指令时，能够提升命中率，那么**降低了读取指令带来的访问延时，从而提升了程序的性能**。

__builtin_expect**提升高速缓存命中率的做法**就是，把最有可能到达的分支的代码放在程序的前面，另外通过增加各分支共同逻辑的指令冗余。

### 提高CPU分支预测的准确性

对于采用五级流水线的CPU，执行一条指令周期一般可以分为以下几个阶段：

1. 取指令（IF）
2. 译码（ID）
3. 执行（EX）
4. 访存（MEM）
5. 写回（WB）

CPU在真正执行一段指令时，并不是严格的每条指令走完一次指令周期，然后再轮到一条指令的，而是采用叫指令流水线的协作模式，一条指令的完整指令周期就是一条流水线，在一个CPU时钟周期上，是有多条指令同时在流水线的不同阶段的，也就是指令周期存在重叠。

以上面unlikely例子中的部分指令缩略来说明：

| 地址 |   (指令)    |            |             |             |        |      |      |
| :--: | :---------: | :--------: | :---------: | ----------- | ------ | ---- | ---- |
|  8   | **mov ...** |   取指令   |    译码     | 执行        | 访存   | 写回 | ...  |
|  10  |             | **jg ...** |   取指令    | 译码        | 执行   | 访存 | ...  |
|  12  |             |            | **mov ...** | 取指令      | 译码   | 执行 | ...  |
|  1a  |             |            |             | **mov ...** | 取指令 | 译码 | ...  |

比如说地址为0x12的这条mov指令，在**取指令**阶段，前面的0x8和0x10位置的两条指令，分别到达了**执行**和**译码**阶段。

对于0x10这条指令，如果它在执行后最终跳转了，那么0x10后面指令走的流水线流程就白费了，这些流水线会被冲刷掉。

CPU在碰到分支时，为了减少跳转指令、增加高速缓存的命中率、和避免有的指令白走了一段流水线流程，存在分支预测机制，分支预测是CPU的一种控制冒险，不同的CPU架构的分支预测机制并不相同，但基本原理都是差不多的，它会预测条件判断为真或假，然后把对应分支的后续指令提上流水线，如果预测失败则重刷流水线。

分支预测机制分为：

- 静态分支预测：主要依赖于编译器，静态的决定一个预测结果（跳转或非跳转），__builtin_expect的实现属于这种范畴
- 动态分支预测：根据之前的选择情况和正确率来调整当前预测值

__builtin_expect的优化利用了**局部性原理**（CPU执行了当前指令，那么附近的指令在不久后也可能被访问），将大概率会到达的分支指令提到靠前的位置，来提高分支预测和高速缓存的命中率。CPU的分支预测机制大多是会有参考局部性原理的。

## **优化的代价**

主要从增加指令冗余上看，是以空间换取时间的一种做法，但并不是所有情况的优化都会出现冗余，而且即使出现一定程度的指令冗余，相对时间上的提升，这点空间上的冗余可能算不了太大的消耗。

## **什么时候可以使用，什么时候不应该使用**

基于likely和unlikely的优化原理，在对某个条件选择语句进行优化之前，必须要判断清楚，这个likely或者unlikely条件是不是在大多数情况下都会成立，这点非常重要，如果判断正确，那么性能会得到提升，如果判断错误，性能不仅没得到提升甚至可能会下降。

所以你可以确定likely或者unlikely条件在大多数情况都成立时可以使用该优化，而在不确定时就不应该使用。

## **likely和unlikely各自适用的情景**

对于unlikely适用于但不仅限于一些错误检查，例子如下（选自Linux内核源码）：

```c
static int omap1_clk_enable_generic(struct clk *clk)
{
	__u16 regval16;
	__u32 regval32;

	if (unlikely(clk->enable_reg == NULL)) {
		printk(KERN_ERR "clock.c: Enable for %s without enable code\n",
		       clk->name);
		return -EINVAL;
	}

	if (clk->flags & ENABLE_REG_32BIT) {
		regval32 = __raw_readl(clk->enable_reg);
		regval32 |= (1 << clk->enable_bit);
		__raw_writel(regval32, clk->enable_reg);
	} else {
		regval16 = __raw_readw(clk->enable_reg);
		regval16 |= (1 << clk->enable_bit);
		__raw_writew(regval16, clk->enable_reg);
	}

	return 0;
}
```

likely适用于根据期望在大部分情况都会执行的主分支情景，例子如下（选自Linux内核源码）：

```c
void omap1_clk_disable(struct clk *clk)
{
	if (clk->usecount > 0 && !(--clk->usecount)) {
		clk->ops->disable(clk);
		if (likely(clk->parent)) {
			omap1_clk_disable(clk->parent);
			if (clk->flags & CLOCK_NO_IDLE_PARENT)
				omap1_clk_allow_idle(clk->parent);
		}
	}
}
```

## **C/C++20标准中的likely和unlikely Attribute**

实现原理与gcc的是大同小异的，关于详细标准可以看[C++ attribute: likely, unlikely (since C++20)](https://en.cppreference.com/w/cpp/language/attributes/likely)，下面节选部分。

### **语法**

```c++
[[likely]]
[[unlikely]]
```

### **解释**

这些属性可应用于标号或语句（除了声明语句）。它们不可同时应用到同一标号或语句。

1. 应用到语句，允许编译器为包含该语句的执行路径，比任何其他不包含该语句的执行路径更可能的情况进行优化。

2. 应用到语句，允许编译器为包含该语句的执行路径，比任何其他不包含该语句的执行路径更不可能的情况进行优化。

当且仅当执行路径中含有到某个标号的跳转时，才认为该执行路径包含该标号：

```c++
int f(int i)
{
    switch(i)
    {
        case 1: [[fallthrough]];
        [[likely]] case 2: return 1;
    }
    return 2;
}
```

**`i == 2` 被认为比 `i` 的任何其他值更可能，但 `[[likely]]` 在 `i == 1` 的情况无效果，尽管它直落到 case 2: 标号。**

### **例子**

```c++
#include <chrono>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <random>
 
namespace with_attributes {
constexpr double pow(double x, long long n) noexcept {
    if (n > 0) [[likely]]
        return x * pow(x, n - 1);
    else [[unlikely]]
        return 1;
}
constexpr long long fact(long long n) noexcept {
    if (n > 1) [[likely]]
        return n * fact(n - 1);
    else [[unlikely]]
        return 1;
}
constexpr double cos(double x) noexcept {
    constexpr long long precision{16LL};
    double y{};
    for (auto n{0LL}; n < precision; n += 2LL) [[likely]]
        y += pow(x, n) / (n & 2LL ? -fact(n) : fact(n));
    return y;
}
}  // namespace with_attributes
 
namespace no_attributes {
constexpr double pow(double x, long long n) noexcept {
    if (n > 0)
        return x * pow(x, n - 1);
    else
        return 1;
}
constexpr long long fact(long long n) noexcept {
    if (n > 1)
        return n * fact(n - 1);
    else
        return 1;
}
constexpr double cos(double x) noexcept {
    constexpr long long precision{16LL};
    double y{};
    for (auto n{0LL}; n < precision; n += 2LL)
        y += pow(x, n) / (n & 2LL ? -fact(n) : fact(n));
    return y;
}
}  // namespace no_attributes
 
double gen_random() noexcept {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_real_distribution<double> dis(-1.0, 1.0);
    return dis(gen);
}
 
volatile double sink{}; // ensures a side effect
 
int main() {
    for (const auto x : {0.125, 0.25, 0.5, 1. / (1 << 26)}) {
        std::cout
            << std::setprecision(53)
            << "x = " << x << '\n'
            << std::cos(x) << '\n'
            << with_attributes::cos(x) << '\n'
            << (std::cos(x) == with_attributes::cos(x) ? "equal" : "differ") << '\n';
    }
 
    auto benchmark = [](auto fun, auto rem) {
        const auto start = std::chrono::high_resolution_clock::now();
        for (auto size{1ULL}; size != 10'000'000ULL; ++size) {
            sink = fun(gen_random());
        }
        const std::chrono::duration<double> diff =
            std::chrono::high_resolution_clock::now() - start;
        std::cout << "Time: " << std::fixed << std::setprecision(6) << diff.count()
                  << " sec " << rem << std::endl; 
    };
 
    benchmark(with_attributes::cos, "(with attributes)");
    benchmark(no_attributes::cos, "(without attributes)");
    benchmark([](double t) { return std::cos(t); }, "(std::cos)");
}
```


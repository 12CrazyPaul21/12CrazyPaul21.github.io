---
title: Golang Trick记录
tags:
  - golang
  - Snippet
  - Best Practice
categories:
  - - golang
date: 2023-05-19 14:19:06
---

> 这篇文章会随时更新

## 镜像源

```bash
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

## 开发环境 tools

```bash
go install -v golang.org/x/tools/gopls@latest                # gopls
go install -v github.com/cweill/gotests/gotests@latest       # gotests
go install -v github.com/fatih/gomodifytags@latest           # gomodifytags
go install -v github.com/josharian/impl@latest               # impl
go install -v github.com/haya14busa/goplay/cmd/goplay@latest # goplay
go install -v github.com/go-delve/delve/cmd/dlv@latest       # dlv
go install -v honnef.co/go/tools/cmd/staticcheck@latest      # staticcheck
go install -v golang.org/x/tools/cmd/godoc@latest            # godoc
```

## vscode调试golang程序

`launch.json` 例子：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Package",
            "type": "go",
            "request": "launch",
            "mode": "debug",
            "program": "${workspaceFolder}/cmd/<app name>",
            "env": {
                "GOARCH": "amd64",
                // 可以用这种方法在程序内通过环境变量来判断是否处于调试模式 os.Getenv("DEBUG")
                // 或者用DEBUG=true go run main.go这种方法
                "DEBUG": "true",
            },
            "args": [],
            "showLog": true
        }
    ]
}
```

## golang 项目结构布局

> golang 项目基本布局可以参考[Standard Go Project Layout](https://github.com/golang-standards/project-layout/blob/master/README_zh.md)，尽管非官方标准，是社区总结的，可以参考这个布局来安排自己项目的库代码、私有代码、主干

基本规则：

- go 文件命名不使用驼峰法，而是以 `_` 下划线划分单词
- golang 项目中的每个 go 文件都必定**从属于某个package**
- 同一目录层级下的所有 go 文件应该**处于同一个 package 中**，不允许存在不同名的 package，否则会出现编译错误，也不是种好的设计习惯
- 对于上一条规则，有一个例外，那就是包的测试代码、示例代码，这些代码与包在同一个目录，包名规则是 `<package name>_test`，文件名规则分别为 `<测试目标>_test.go`、`example_<目标-可选>_test.go`。总结本条和上一条规则，换句话说，对于所有处于同一个文件夹内的**非测试、非示例代码，必须使用同一个包名**
- 项目中每个目录层级下使用的 **package 名应该与文件夹同名**（项目根目录情况不同）
- 如果项目是作为一个**库发布**的话，项目**根目录层级**下的 package 不能为 main，这种情况**最好 pakcage 与项目同名**
- 如果希望项目可以作为一个**库发布**，也可以做为**独立可执行文件发布**的话，可以将 main 包，放在 `cmd/<项目名>/main.go` 或 `cli/cmd/<项目名>/main.go`
- 如果**仅作为独立可执行文件发布**的话，可以考虑直接将 main 包放在项目根目录

`import` 的基本规则：

- 以目录结构的格式 `import`
- `import` 其它第三方项目的包时，最好仅 `import` 其 `pkg` 的包，因为这是显式指示为公开的包
- 不能 `import` 其它项目的 `main`、`internal`、`cli`、`cmd` 等包
- 对于仅需要包内初始化（`init`），而不用直接使用的包，可以匿名方式 `import`，类似 `import _ "foo.com/bar"`

### 例子

#### 项目仅以库形式发布

```shell
# github.com/username/xpack
# 目录结构
./pkg/handler		# package pkg/handler
./go.mod
./pack_unpack.go	# package xpack

# import
import "github.com/username/xpack"
import "github.com/username/xpack/handler"
```

#### 项目以库和独立可执行文件形式发布

```shell
# github.com/username/xpack
# 目录结构
./cli/cmd/xpack/main.go
./pkg/handler		# package pkg/handler
./go.mod
./pack_unpack.go	# package xpack

# import
import "github.com/username/xpack"
import "github.com/username/xpack/handler"
```

#### 项目以多个独立可执行文件形式发布

```shell
# github.com/username/xpack
# 目录结构
./cli/cmd/xpack/main.go
./cli/cmd/xunpack/main.go
# or
./cmd/xpack/main.go
./cmd/xunpack/main.go
```

## 使用自定义包

有两种方式：

- 禁用 `GoModule` 时，将项目安排在 `GOPATH` 或 `GOROOT` 中
- Go v1.11 之后新版本支持 `GoModule`，默认启用，最好使用这种方式

### 引用放置在 GOPATH 中的自定义包

> 最好别用这种方法，应该使用 `GoModule` 

对于标准库的包，编译器会从 `GOROOT` 目录中寻找，而非标准库的包在 `GoModule` 未启用（即 `GO111MODULE="on"` ）时，编译器会从 `GOPATH` 目录中寻找，利用这个特性，可以将自定义的包安排在 `GOPATH` 中。

首先需要确认 `GOPATH` 的位置，需要注意的是，不应该为了自己项目的安排而去修改 `GOPATH`，比较好的做法是将自定义项目放进这里来

```bash
go env GOPATH
# 假设输出：/home/username/go
```

```bash
# 假设包名为github.com/username/pack
mkdir pack
cd pack
go mod init github.com/username/pack
cd ..

# 将改包按照包名的格式放入$GOPATH/src/中
mkdir -p $GOPATH/src/github.com/username
mv pack/ $GOPATH/src/github.com/username
```

将项目按包名结构拷贝进 `$GOPATH/src` 中后，旧可以在项目中使用包名来 `import` 这个项目了

### 使用 GoModule 的方式来引用自定义包

```bash
# 首先得确保启用了GoModule
go env -w GO111MODULE='on'
```

那么对于本项目的使用，对于程序员得角度，可以忽略掉 `GOPATH` 了，项目可以存放在任意可访问的位置中，在新项目中，启用 `GoModule` 是更好的做法，项目的依赖关系由 `go.mod` 和 `go.sum` 来管理。`GOPATH` 并不是没有用了，只是交给编译器自己安排，拉回来的库，编译器会缓存在 `$GOPATH/pkg/mod` 中。

> - 可以用 `go mod edit ...` 命令来修改 `go.mod`，最好不要手动去编辑 `go.mod`
> - 模块必须指定一个版本号，对于 git 仓库，版本号与 tag 绑定，模式为 `v<major_number>.<minor_number>.<patch_number>`

#### 引用本地自定义库

```bash
# 1. 添加自定义依赖，必须指定一个版本号，版本号为仓库的tag
# 对于本地仓库，如果仍未创建tag的话，可以随意指定一个版本号
go mod edit --require github.com/example/foobar@v0.1.0

# 2. 将仓库replace为本地自定义目录，假设这个foobar放在当前项目的上一层目录中
# 这里可以不需要指定版本号
go mod edit --replace github.com/example/foobar=../foobar

# 3. 查看更新后的go.mod文件内容
cat go.mod
```

```go
file: go.mod

module example.com/pkgname

go 1.20

require github.com/example/foobar v0.1.0

replace github.com/example/foobar => ../foobar
```

这时候可以直接用包名引用模块了，由于是在本地，所以不会为 foobar 在 `go.sum` 中添加条目，不过这种做法最好是用于本地开发或测试场景，不建议在生产环境中使用

#### 公有仓库发布

对于上面本地的例子，如果认为该库足够稳定可以发布了，那么可以为其按照 `v<major_number>.<minor_number>.<patch_number>` 模式打一个 `tag` 并推送到远程公有仓库中，这样就可以直接通过 `go get github.com/example/foobar` 来将模块拉回来了，`go` 会将模块缓存在 `$GOPATH/pkg/mod/github.com/example/foobar` 中，并在 `go.sum` 中添加条目。

#### 私有仓库发布

如果希望推送到私有仓库中，基本操作与公有仓库发布方式一样，首先还是以版本号打`tab` 并推送到远程中，但是现在 `go get` 是访问不了私人仓库的，需要做一些额外的操作。

这里以 `github` 的仓库为例，首先确保本机的 `ssh` 公钥已经加入到 `github` 账号中，然后修改本机的 `git` 配置

> 可参考：[Why does "go get" use HTTPS when cloning a repository?](https://go.dev/doc/faq#git_https)

```bash
# 以https方式来访问github
git config --global url.git@github.com:.insteadOf https://github.com/
# 检查修改
cat ~/.gitconfig
# 上面的git config指令是给~/.gitconfig添加了以下内容，即改为以https方式来访问
[url "git@github.com:"]
	insteadOf = https://github.com/
```

这时候已经可以 `go get` 私人仓库了，但是在执行时需要指明 `GOPRIVATE` 环境变量，显式让 `go get` 知道哪些包来自私人仓库，有临时指定和持久修改两种做法：

```bash
# 临时指定GOPRIVATE

# go get
GOPRIVATE=github.com/example/foobar go get -u github.com/example/foobar
# go mod tidy
GOPRIVATE=github.com/12CrazyPaul21/xblg go mod tidy

# 如果需要指定多个private仓库的话，使用","（逗号）隔开
GOPRIVATE="github.com/username/pirv2,github.com/username/pirv1" go mod tidy

# 使用通配符也可以
GOPRIVATE="github.com/username/*" go mod tidy
```

```bash
# 持久化修改GOPRIVATE环境变量，规则与临时指定是一样的
go env -w GOPRIVATE='github.com/username/*,gitlab.com/username/*'
```

## golang 注释风格

golang 的注释风格推崇简洁，尽可能仅留下必要的注释，公开内容尽量给出比较详细的注释，私有内容可随意些。


> golang 的注释规范可以参考（也可以直接参考golang的源码）：
>
> - [Go Doc Comments](https://go.dev/doc/comment)
> - [Godoc: documenting Go code](https://go.dev/blog/godoc)
> - [src/encoding/gob/doc.go](https://go.dev/src/encoding/gob/doc.go)


- 包文档注释最好使用 `/**/` ，而其它注释使用 `//`
- 私有内容的注释不会出现在库文档中
- example 也会包含在文档中，但不会包含 test
- 分行使用空白注释行分隔，否则会被当做同一行处理
- 以 `tab` 开始代码块（block）
- 可以使用 `#` 来开始一个标题（前后需要插入空白行）
- `[path/filepath]` 可以创建指定特定包的 `link`
- `[package_name.xxx]` 可以创建指向特定包的某个成员的 `link`
- 超链接可以直接插入
- `-` 可以插入无序列表（前面加入一个 `tab`），改为 `数字.` 的话，则为有序列表

### 例子

```go
file: ./pack/handler.go
// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package pack

// 常量定义
const (
	C1 = 0 	// 常量1
	C2 		// 常量2
)

// 常量定义2
// See: https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
const (
	C3 = iota
	C4
)

// 公开变量定义
var (
	V1 int = 0
	V2 string = "public V2"
)

// private_struct是私有的，不会出现在文档中
type private_struct struct {

}

// Handler是公开的
//
// 独立行
//	// 代码段
//	h := Handler{}
// 结束代码段
//
// # 标题
//	h := Handler{}
type Handler struct {

}

// say hello
func (h Handler) Hello() {

}

// 这是一个无序列表
//	- 条目1
//	- 条目2
// 这是一个有序列表
//  1. Item 1.
//  2. Item 2.
//  3. Item 3.
func (h Handler) Handle() {

}

// give up
func (h *Handler) GiveUp() {

}
```

```go
file: ./pack/example_test.go

package pack_test

import (
	"testing"

	. "phantom.com/tdoc/pack"
)

// Example<类型>_<字段>
func ExampleHandler() {
	h := Handler{}
	h.Hello()
}

// Handler.GiveUp's example
func ExampleHandler_GiveUp() {
	// give up example
	h := Handler{}
	h.GiveUp()
}

// Test测试不会进入文档
func TestHandle(t *testing.T) {
	h := Handler{}
	h.Handle()
}
```

`godoc` 的输出如下（这里展现不出实际的效果）：

```shell
type Handler
Handler是公开的

独立行

// 代码段
h := Handler{}
结束代码段

标题
h := Handler{}
type Handler struct {
}
▾ Example

Example<类型>_<字段>

Code:

h := Handler{}
h.Hello()
func (*Handler) GiveUp
func (h *Handler) GiveUp()
give up

▾ Example

Handler.GiveUp's example

Code:

// give up example
h := Handler{}
h.GiveUp()
func (Handler) Handle
func (h Handler) Handle()
这是一个无序列表

条目1
条目2
这是一个有序列表

Item 1.
Item 2.
Item 3.
func (Handler) Hello
func (h Handler) Hello()
say hello
```

### package 文档注释

- 邻接在 `package <name>` 前面的注释（与 ` package <name>` 之间没有空白行）为`package` 的文档注释。如果有 `copyright` 描述或者 `//go:<xxx>` 指示器的话，使用空白行跟文档注释分隔。
- 如果内容比较多的话，可以在包文件夹内用一个独立的 `doc.go` 文件来存放该包的文档注释
- 如果包内其它 go 文件也存在包文档注释，那么会根据文件名的字母顺序**汇总**起来，不过最好不要对汇总的顺序做假设，如果存在 `doc.go` 的话，就最好不要在其它 go 文件中添加包文档注释
- 包文档注释的**概要（synopsis）** 采用文档注释的**第一行**
- 文档注释使用一个独立的**空白行**注释来**分行**

#### 例子

```go
file: ./pack/doc.go
// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
// 包括本行，以上不属于文档注释

//go:指示器

/*
pack包的文档注释（Overview）开头，这段属于概要（Synopsis），直接用//也是可以的
*/
//
// //和/**/可以混用
// 但是它们之间不能出现空白行
//
// 不过上面这种空白的注释行是没问题的
/*
*/
// 上面这样使用/**/的空白行也行
//
// hello 
// world
// 上面两行在文档注释中跟本段处于同一行，如果需要分行，用用空白行注释行分隔
//
// hello
//
// world
/*
hello

world
*/
/*
doc.go内的文档注释

# 标题1

内容

# 标题2

内容
*/
package pack
```

```go
file: ./pack/e.go
// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*
同为pack包内e.go文件的包文档注释，因为文件名的字母顺序在doc.go后面，所以接在doc.go的后面
*/
package pack
```

```go
file: ./pack/f.go
// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*
同为pack包内f.go文件的包文档注释，因为文件名的字母顺序在e.go后面，所以接在e.go的后面
*/
package pack
```

通过 `godoc` 查看上面这个包的文档注释，能看到概要（Synopsis）是下面这样的：

```bash
pack	pack包的文档注释（Overview）开头，这段属于概要（Synopsis），直接用//也是可以的
```

概述（Overview）则是下面这样（这里展现不出实际的效果）：

```shell
pack包的文档注释（Overview）开头，这段属于概要（Synopsis），直接用//也是可以的

//和/**/可以混用 但是它们之间不能出现空白行

不过上面这种空白的注释行是没问题的

上面这样使用/**/的空白行也行

hello world 上面两行在文档注释中跟本段处于同一行，如果需要分行，用用空白行注释行分隔

hello

world

hello

world

doc.go内的文档注释

标题1
内容

标题2
内容

同为pack包内e.go文件的包文档注释，因为文件名的字母顺序在doc.go后面，所以接在doc.go的后面

同为pack包内f.go文件的包文档注释，因为文件名的字母顺序在e.go后面，所以接在e.go的后面
```

### go doc

```bash
# 命令行模式使用以下命令，可以直接输出特定包的文档
go doc <包名>
```

### godoc

```bash
# 可以在web中阅览文档
godoc -http=localhost:6060
```

## Example 与 Test

`example` 和 `test` 的写法类似，都是在写在特定包文件夹内

- 文件名以 `_test.go` 后缀结尾
- 对于 `example` 用例的文件名，最好使用 `example_<补充>_test.go` 格式，`test` 用例则可以针对特定目标命名
- 使用的包名是 `<原始包名>_test`
- `test` 方法以 `Test` 开头，测试工具会自动识别
- 方法名以 `Example` 开头的自动识别为 `example`
- `example` 方法的命名格式是 `Example<类型>_<字段>`，这主要供 `doc` 自动在文档上跟目标进行绑定

```go
file: ./pack/handler.go

package pack

type Handler struct {}

func (h Handler) Hello() {}
func (h Handler) Handle() {}
func (h *Handler) GiveUp() {}
```

```go
file: ./pack/exmaple_test.go 或者 ./pack/example_handler_test.go

package pack_test

import . "phantom.com/tdoc/pack"

// Example<类型>_<字段>
func ExampleHandler() {
	h := Handler{}
	h.Hello()
}

func ExampleHandler_GiveUp() {
	h := Handler{}
	h.GiveUp()
}
```

```go
file: ./pack/handler_test.go

package pack_test

import (
	"testing"

	. "phantom.com/tdoc/pack"
)

func TestHandler(t *testing.T) {
	h := Handler{}
	h.Handle()
}
```

```bash
# 对特定包进行测试（也可以使用完整包名）
go test ./pack
# 执行整个包所有测试用例
go test ./...
```

## init 执行顺序

从 `main` 包为入口，会先递归执行完所有的 `import` 指令，每次递归会完成 `包常量`、`包变量`、`包函数`、`包init()` 初始化，当回到 `main` 包之后，也是按照这个顺序初始化，之后进入到 `main.main` 中。

- 如果途中有重复的包，则只 `import` 一次
- 如果同一个包中，有多个 `go` 文件有 `init` 方法，则按照 `go` 文件名的字母顺序调用
- 可以通过 `GODEBUG=inittrace=1 go run .` 分析 `init` 顺序

![golang init](/images/post/normalization/golang/golang_init.webp)

<center><font size="2">很经典的一张图，from：<a href="https://david-yappeter.medium.com/init-in-go-programming-31e2c2bc2371">《init() in Go Programming》</a></font></center>

### 例子

```go
//
// file: ./pack/a.go
//

package pack

import "fmt"

const p_a string = "pack a init"

func ainfo() {
	fmt.Println(p_a)
}

func init() {
	ainfo()
}

//
// file: ./pack/b.go
//

package pack

import "fmt"

const p_b string = "pack b init"

func binfo() {
	fmt.Println(p_b)
}

func init() {
	binfo()
}

//
// file: ./pack/c.go
//

package pack

import "fmt"

const p_c string = "pack c init"

func cinfo() {
	fmt.Println(p_c)
}

func init() {
	cinfo()
}
```

```go
//
// file: ./a.go
//

package main

import "fmt"

const m_a string = "main a init"

func ainfo() {
	fmt.Println(m_a)
}

func init() {
	ainfo()
}

//
// file: ./f.go
//

package main

import "fmt"

const m_f string = "main f init"

func finfo() {
	fmt.Println(m_f)
}

func init() {
	finfo()
}

//
// file: ./main.go
//

package main

import (
	"fmt"

	_ "phantom.com/tinit/pack"
)

const m_m string = "main main init"

func maininfo() {
	fmt.Println(m_m)
}

func init() {
	maininfo()
}

func main() {
	fmt.Println("main")
}
```

```bash
$ go run .
# 输出
# pack a init
# pack b init
# pack c init
# main a init
# main f init
# main main init
# main
```

## 命名函数返回值

```go
func generate() (name string) {
    name = "hello"
    return
}

func generate() (id int, name string) {
    id = 1
    name = "hello"
    return
}
```

## 有缓冲通道与无缓冲通道

```go
// 无缓冲通道
unbuffered := make(chan int)

// 有缓冲通道
buffered := make(chan int, 1)
```

无缓冲通道在初始化后，缓冲区是空的，对于这种通道，golang 会保证一对发送者和接收者，在就绪后同一时间进行数据交换，否则一方处于阻塞中，而有缓冲通道则没有这种保证

## 单向 channel

```go
func send(ch chan<- int, n int) {
	ch <- n
}

func receive(ch <-chan int) int {
	return <- ch
}

func main() {
	ch := make(chan int)

	var sender chan<- int = ch
	var receiver <-chan int = ch

	// 直接创建方法，不过一般不会这么直接创建
	// sender := make(chan<- int, 10)
	// receiver := make(<-chan int, 10)

	go func() {
		send(sender, 2)
	}()

	fmt.Println(receive(receiver))
}
```

单向 channel 常见的地方，如定时器

```go
func main() {
	var timeout <-chan time.Time = time.After(2 * time.Second)
	select {
	case <- timeout:
		fmt.Println("timeout")
	}
    // or
    // <- timeout
}
```

## select

```go
package main

import (
	"fmt"
	"os"
	"os/signal"
	"time"
)

var (
	interrupt chan os.Signal
	timeout <-chan time.Time
	complete chan string
)

func main() {
	interrupt = make(chan os.Signal, 1)
	timeout = time.After(3 * time.Second)
	complete = make(chan string)

	signal.Notify(interrupt, os.Interrupt)
	go func() {
		var input string
		fmt.Printf("what's your first name: ")
		fmt.Scanln(&input)
		complete <- input
	}()

	select {
	case <-interrupt:
		fmt.Println("\ninterrupt")
	case <-timeout:
		fmt.Println("\ntimeout")
	case str := <-complete:
		fmt.Println("your first name:", str)
	}
}
```

## WaitGroup

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
    // WaitGroup是线程安全的
	w := sync.WaitGroup{}

	for i := 0; i < 5; i++ {
		w.Add(1)
		go func(i int, w *sync.WaitGroup) {
			defer w.Done()
			time.Sleep(time.Second)
			fmt.Println(i)
		}(i, &w)
	}

	w.Wait()
}
```

## 灵活的switch

```go
// 1. 每个case不需要显式break（除非特殊流程打断），要想过渡到下一个case的话，使用fallthrough
switch generate() {
case 1:
	fmt.Println("1")
case 10:
	fmt.Println("10")
	fallthrough
case 11:
    fmt.Println("11")
}

// 2. 多个case合并
switch generate() {
case 1, 10, 13:
    fmt.Println("1 or 10 or 13")
default:
	fmt.Println("unknwon")
}

// 3. 类型断言
var i interface{}
i = "hello"
switch i.(type) {
case string:
	fmt.Println("string")
}

// 4. 无表达式switch
d := 10
s := "hello"
switch {
case s == "world":
	fmt.Println("s == world")
case d < 10:
	fmt.Println("d < 10")
case d > 10:
	fmt.Println("d > 10")
default:
	fmt.Println("d == 10")
}
```

## 值接收器与指针接收器

```go
type human struct {}

// 值接收器
func (h human) speak() {}

// 指针接收器
func (h *human) notify() {}
```

接收器（receiver）是与类型相关的方法进行绑定的隐式传送的参数，值接收器传送的是类型值的副本，而指针接收器则传送的是本体的指针

### 方法集（method sets）

方法集（method sets）定义了**一组关联到**给定类型的**值**或**指针**的**方法**，方法在定义时使用的接收器（receiver）决定了该方法关联的是值、指针或者两者都关联。

golang 规范定义的关联规则如下：

| 类型 | 方法接收器       |
| ---- | ---------------- |
| T    | (t T)            |
| *T   | (t T) and (t *T) |

| 方法接收器 | 类型     |
| ---------- | -------- |
| (t T)      | T and *T |
| (t *T)     | *T       |

```go
import (
    "fmt"
    "reflect"
)

type A struct {}

func (a A) ValueMethod() {}
func (a *A) PointerMethod() {}

func printMethodSet(v interface{}) {
    t := reflect.TypeOf(v)
    fmt.Printf("%s method set count : %d\n", t.String(), t.NumMethod())
    for i := 0; i < t.NumMethod(); i++ {
        m := t.Method(i)
        fmt.Printf("  %s\n", m.Name)
    }
}

func main() {
    printMethodSet(A{})
    printMethodSet(&A{})
}

// 输出：
// main.A method set count : 1
//   ValueMethod
// *main.A method set count : 2
//   PointerMethod
//   ValueMethod
```

#### 接口（interface）与方法集

golang 的接口是非侵入式的，也没有限定使用的是值接收器还是指针接受器，只需要接口定义的方法出现在类型的方法集中

```go
type A struct {}

func (a A) f1() {}
func (a *A) f2() {}

type I1 interface {
    f1()
}

type I2 interface {
    f2()
}

func callI1(i1 I1) {}
func callI2(i2 I2) {}

func main() {
    callI1(A{})
    callI1(&A{})

    // 由于A实体的方法集中并没有f2，所以用其调用callI2的话，编译会报错
    // compile error： cannot use A{} (value of type A) as I2 value in argument 
    // to callI2: A does not implement I2 (method f2 has pointer receiver)
    //
    // callI2(A{})

    callI2(&A{})
}
```

## 嵌入类型（type embedding）

嵌入（匿名）类型有**嵌入值类型**和**嵌入指针类型**两种方式，嵌入者称为**外部类型**，被嵌入者称为**内部类型**，同一个内部类型不能同时以两种方式进行嵌入。

嵌入后等于将内部类型的方法或变量也嵌入到了外部类型中，这个过程称为**内部类型的提升（promotion）** 。内部类型的方法（promoted method）被调用时，这些内部类型方法的**接收器仍然是内部类型**，而非外部类型。不过需要注意，对于这两种嵌入方式，它们**方法集（method sets）的提升规则是不一样的**

```go
type Com struct {}

// 嵌入值类型
type A struct {
    Com
}

// 嵌入指针类型
type B struct {
    *Com
}

// 组合
type C struct {
    com Com
}
```

### 不同点

#### 初始化方式不一样

```go
type A struct {
    v string
}

type B struct {
    A
}

type C struct {
    *A
}

func main() {
    // 嵌入值方式就跟普通类型一样的初始方法
    b := B{}
    
    //
    // 嵌入指针方式
    //
    
    c := C{&A{}}
    
    // 可动态改变，也可以与其它对象分享这个A的对象（因为是指针）
    c.A = &A{}
    
    // 如果初始化时不初始化嵌入指针就使用的话，会空指针访问（即使是一个方法）
    ec := C{}
    ec.v = "hello" // runtime error（segmentation violation）
}
```

#### 内部类型方法集提升规则不一样

> 提升之后的方法可加入方法集，这部分对于接口的适用范围与普通类型是一样的

| 外部类型 | 内部类型 | 提升方法         |
| -------- | -------- | ---------------- |
| S        | T        | (t T)            |
| *S       | T        | (t T) and (t *T) |
| S        | *T       | (t T) and (t *T) |
| *S       | *T       | (t T) and (t *T) |

```go
import (
    "fmt"
    "reflect"
)

type A struct {}

func (a A) ValueMethod() {}

func (a *A) PointerMethod() {}

type B struct {
    A
}

type C struct {
    *A
}

func printMethodSet(v interface{}) {
    t := reflect.TypeOf(v)
    fmt.Printf("%s method set count : %d\n", t.String(), t.NumMethod())
    for i := 0; i < t.NumMethod(); i++ {
        m := t.Method(i)
        fmt.Printf("  %s\n", m.Name)
    }
}

func main() {
    printMethodSet(B{})
    printMethodSet(&B{})

    printMethodSet(C{})
    printMethodSet(&C{})
}

// 输出：
// main.B method set count : 1
//   ValueMethod
// *main.B method set count : 2
//   PointerMethod
//   ValueMethod
// main.C method set count : 2
//   PointerMethod
//   ValueMethod
// *main.C method set count : 2
//   PointerMethod
//   ValueMethod
```

### 相同点

#### 对于内部类型字段的访问方式一样

假设内部类型与外部类型没有重名字段，那么可以直接通过外部类型来访问内部类型的变量或者访问（编译器会自动处理）

```go
type A struct {
    s string
}

func (a A) f1() {}
func (a *A) f2() {}

type B struct {
    A
}

type C struct {
    *A
}

func main() {
    b := B{A{}}
    c := C{&A{}}

    //
    // 直接用<外部类型>.<字段>来访问
    //
    
    b.s = ""
    b.f1()
    b.f2()

    c.s = ""
    c.f1()
    c.f2()
}
```

#### 相同点：对于内部与外部有重名字段的访问方式一样

两种嵌入方式，如果内部类型与外部类型有重名字段，那么内部类型的字段会被屏蔽，要想访问的话需要显式引用内部类型

```go
type A struct {
    v string
}

func (a A) f1() {
    fmt.Println("A f1")
}

func (a *A) f2() {
    fmt.Println("A f2")
}

type B struct {
    A
    v string
}

func (b B) f1() {
    fmt.Println("B f1")
}

func (b *B) f2() {
    fmt.Println("B f2")
}

type C struct {
    *A
    v string
}

func (c C) f1() {
    fmt.Println("C f1")
}

func (c *C) f2() {
    fmt.Println("C f2")
}

func main() {
    b := B{A{v: "A v"}, "B v"}
    c := C{&A{v: "A v"}, "C v"}

    fmt.Println(b.v)	// B v
    b.f1()				// B f1
    b.f2()				// B f2

    fmt.Println(c.v)	// C v
    c.f1()				// C f1
    c.f2()				// C f2

    fmt.Println(b.A.v)	// A v
    b.A.f1()			// A f1
    b.A.f2()			// A f2

    fmt.Println(c.A.v)	// A v
    c.A.f1()			// A f1
    c.A.f2()			// A f2
}
```

#### 都不能访问其它包嵌入对象的私有字段

```go
file: ./pack1/foo.go

package pack1

type bar struct {
    V string
}

type Foo struct {
    bar
    v1 string
    V2 string
}

func (f Foo) f1() {}
func (f *Foo) f2() {}
func (f Foo) F1() {}
func (f *Foo) F2() {}
```

```go
file ./main.go

package main

import . "pack1"

type A struct {
    Foo
}

type B struct {
    *Foo
}

func main() {
    var a A
    b := B{&Foo{}}
    
    a.V = ""    // 尽管V属于pack1包中的私有类型bar，但是嵌入后能访问bar的公有类型
    b.V = ""
    
    a.v1 = ""	// compile error
    a.V2 = ""
    a.f1()		// compile error
    a.f2()		// compile error
    a.F1()
    a.F2()
    
    b.v1 = ""	// compile error
    b.V2 = ""
    b.f1()		// compile error
    b.f2()		// compile error
    b.F1()
    b.F2()
}
```

## goroutine 的用户栈

常规的 goroutine 使用的是用户栈，栈空间可动态伸缩，可有效避免栈溢出

## 对于 golang 中返回局部变量的指针是否安全？

在 golang 中将局部变量的指针返回是安全的，因为运行时和 GC 会自动进行维护，不过要这样写时，最好避免出现数据竞争（race），而且也可以考虑使用 `new` 来代替这种做法

## golang 是静态还是动态语言？

golang 虽然是编译型的静态语言，但是支持很多动态语言的特性

## 引用类型

golang 有六种引用类型：

1. 切片（slice）
2. 映射（map）
3. 通道（channel）
4. 接口（interface）
5. 指针（pointer）
6. 函数（func）

> 除了上面之外的，基本都属于是值类型，值类型大多直接在栈中分配，而引用类型的本体大多存储在堆中

## 数组与切片

数组是固定长度的值类型，而切片是长度可变的引用类型，所以在函数传递时，数组的开销比切片要大。

数组在初始化时必须指定大小，因为它容量是固定的

```
a := [2]int{1, 2}
a := [...]int{1, 2, 3}
```

切片初始化时不需要指定大小

```go
a := []int{1, 2, 3}
// 也能使用make来创建切片
// 其中后两个可选参数分别是
// 长度和容量
a := make([]int, 3, 6)
```

从数组或切片创建切片的方法是 `arr[起始索引:结束索引+1:新切片容量]`，其中新切片容量不能不能小于`结束索引+1`，也不能大于原本数组或切片的容量，如果`起始索引` 或 `结束索引` 省略，那么表示 `从头` 或者 `到尾`。

```go
a := make([]int, 4, 10)
for i := 0; i < 4; i++ {
    a[i] = i
}

sa := a[:]  // [0 1 2 3]
sa = a[:3]  // [0 1 2]
sa = a[3:]  // [3]

sa = a[1:3:10]
sa = a[1:3:8]
sa = a[1:3:3]

// compile error: invalid slice indices: 2 < 3
// sa = a[1:3:2]

// compile error: invalid slice indices: 1 < 3
// sa = a[1:3:1]

// runtime error: panic: runtime error: slice bounds out of range [::11] with capacity 10
sa = a[1:3:11]
```

需要注意的是，这种创建切片的方法，切片的元素还是原来的实体，而不是一个副本，需要脱离关系的话，请使用 `copy`。

```go
a := [...]string{"one", "two", "three"}
s1 := a[1:2]

s2 := make([]string, 3, 6)
copy(s2, a[:])

fmt.Println(&s1[0])
fmt.Println(&a[1])
fmt.Println(&s2[1])

// 输出：
// 0xc00009ac10
// 0xc00009ac10
// 0xc0000aa1f0
```

数组和切片基本操作是一样的

```go
//
// 遍历
//

s := [...]string{"one", "two", "three"}
for index, value := range s {
    // ...
}

for i := 0; i < len(s); i++ {
    // ...
}

// 长度和容量
len(str)
cap(str)

//
// 数组不能直接追加或者删除元素
//

a := [...]string{"one", "two", "three"}
s := append(a[:], "four") // 数组需要转为切片之后才能追加，得到的是一个切片
// [one two three four]

// 切片追加元素
s = append(s, "five")
// [one two three four five]

// 删除元素
index := 3
s = append(s[:index], s[index + 1:]...)
// [one two three five]
```

## map

golang 的 map 定义方式很容易忘记，方式为：`map[Key]value`

```go
// 后面指定的是容量（可选参数）
m := make(map[string]int, 10)

m["key"] = 1

for k, v := range m {
	// ...
}

delete(m, "key")
```

## make 与 new

```go
file: src/builtin/builtin.go

// The make built-in function allocates and initializes an object of type
// slice, map, or chan (only). Like new, the first argument is a type, not a
// value. Unlike new, make's return type is the same as the type of its
// argument, not a pointer to it. The specification of the result depends on
// the type:
//
//	Slice: The size specifies the length. The capacity of the slice is
//	equal to its length. A second integer argument may be provided to
//	specify a different capacity; it must be no smaller than the
//	length. For example, make([]int, 0, 10) allocates an underlying array
//	of size 10 and returns a slice of length 0 and capacity 10 that is
//	backed by this underlying array.
//	Map: An empty map is allocated with enough space to hold the
//	specified number of elements. The size may be omitted, in which case
//	a small starting size is allocated.
//	Channel: The channel's buffer is initialized with the specified
//	buffer capacity. If zero, or the size is omitted, the channel is
//	unbuffered.
func make(t Type, size ...IntegerType) Type

// The new built-in function allocates memory. The first argument is a type,
// not a value, and the value returned is a pointer to a newly
// allocated zero value of that type.
func new(Type) *Type
```

从定义可知，`make` 和 `new` 的区别：

- `make` 返回的是**实体对象**，`new` 则是**对象指针**
- `make` 主要用于 **切片(slice)、映射(map)  和 通道(channel) 等引用类型，`new` 应用更广，但主要是用于值类型
- `make` 和 `new` 都是在堆上进行分配（不过最好不要肯定回答，而是不要去关心这个问题，让 golang 运行时自己安排）
- `make` 会给对象初始化，而 `new` 分配完内存并将内存块清零（零值）后不会按照类型做相应的初始化，对于引用类型，最好使用 `make`

## interface 与 interface{}

golang 支持**非侵入式**的**鸭子类型（duck typing）** ，通过 `interface` 实现，不需要类型显式的声明实现了接口，只需要接口的方法集是类型的方法集子集即可。形象点说就是，如果“它”具有鸭子的所有行为，那么“它”就是一只鸭子，鸭子类型通常出现在动态语言中，尽管 golang 是静态语言，不够它确实采用这种设计风格。

`interface{}` 是一个没有方法的**空接口（empty interface）** ，任何类型都至少零个方法，也就是说任何类型都实现了一个空接口，那么如果一个函数接受一个 `interface{}` 类型的参数，意味着可以将任何类型（包括数组、切片...）传给它，这种函数通常可以配合反射（reflect）或类型断言来处理。

```go
file: src/builtin/builtin.go

// any is an alias for interface{} and is equivalent to interface{} in all ways.
type any = interface{}
```



> 以下两点需要留意一下：
>
> - 对于接收空接口参数的函数来说，仍然不能说它接受的类型是任意类型，它是有一个准确的类型的，那就是空接口（`interface{}`）
> - 一个类型的空指针不是一个空接口
>
> ```go
> type I interface {
> 	foo()
> }
> type T struct {}
> 
> func main() {
>     var ei interface{}	// <nil>
>     var i I				// <nil>
>     var p *T			// <nil>
>     
>     ei == nil			// true
>     i == nil 			// true
>     p == nil 			// true
> 
>     ei == i				// true
>     
>     // compile warning: this comparison is never true; the lhs of the comparison has been assigned a concretely typed value (SA4023)go-staticcheck
>     p == ei				// false
>     
>     // compile error: invalid operation: p == i (mismatched types *T and I)
>     // p == i
> }
> ```

### 空接口反射

```go
import "reflect"

func printTypeName(v interface{}) {
    t := reflect.TypeOf(v)
    fmt.Printf("type: %s\n", t.String())
}
```

### 变参函数与类型断言（type assertion）

变参函数通常配合 `interface{}` 定义（比如 `fmt.Printf`）

```go
func myprint(args ...interface{}) {
    for idx, v := range args {
        switch v.(type) {
        case string:
            fmt.Printf("%d string value: %v\n", idx, v)
        case int:
            fmt.Printf("%d int value: %v\n", idx, v)
        default:
            fmt.Println("unknown")
        }
    }
}

func main() {
    myprint("hello", "world", 1234, 9234.0)
}
```

```go
// 接口类型断言的其它例子

type animal interface {
    speak()
}

type human struct {}
func (h human) speak() {}

func action(a animal) {
    if h, ok := a.(human); ok {
        h.speak()
    }
}

func main() {
    action(human{})
}
```

## panic 与 recover

```go
var (
    ErrNormal = errors.New("this is an error")
)

func main() {
    defer func() {
        if p := recover(); p != nil {
            fmt.Println(p)
        }
    }()

    panic(ErrNormal)
}

// switch方式
func main() {
    defer func() {
        switch p := recover(); p {
        case nil:
            fmt.Println("no panic")
        case ErrNormal:
            fmt.Println("error: ", p)
        default:
            panic(p)
        }
    }()

    // panic(fmt.Errorf("runtime error: %d", 1))
    panic(ErrNormal)
}
```

## Tag 的反射

```go
type human struct {
    Name string `mytype:"name" myattr:"12"`
    Age  int    `mytype:"age"`
    foo  string
}

func main() {
    h := human{"phantom", 27, "foobar"}
    t := reflect.TypeOf(h)
    v := reflect.ValueOf(h)

    for i := 0; i < t.NumField(); i++ {
        field := t.Field(i)
        if tag := field.Tag.Get("mytype"); len(tag) != 0 {
            fmt.Printf("%s = %v\n", tag, v.FieldByName(field.Name))
            if attr := field.Tag.Get("myattr"); len(attr) != 0 {
                fmt.Println("  attr:", attr)
            }
        }
    }
}
```

## 编译指令（compiler directives）

golang 支持**编译指令（compiler directives）**  ，这是一种特殊的注释，编译器会根据编译指令在编译期间执行一些处理，这种指令大多使用`//go:<directive>` 这样的前缀。这里列出一部分，并说明它们的功能

> 可参考：
>
> - [compiler directives](https://pkg.go.dev/cmd/compile#hdr-Compiler_Directives)
> - [generating code](https://go.dev/blog/generate)
> - [build constraints](https://pkg.go.dev/cmd/go#hdr-Build_constraints)
> - [Go Compiler Directives](https://bdemirpolat.medium.com/golang-compiler-directives-dc61820add40)

| compiler directive                           | 说明                                                         |
| -------------------------------------------- | ------------------------------------------------------------ |
| //go:generate [command args...]              | 命令行执行go generate后会执行代码中//go:generate [command args...]的命令，主要用于生成文件 |
| //go:systemstack                             | 指示函数需要进入系统栈执行                                   |
| //go:noescape                                | 跳过逃逸检查                                                 |
| //go:norace                                  | 跳过竞争检查                                                 |
| //go:nosplit                                 | 跳过stack overflow检查                                       |
| //go:noinline                                | 禁止内联                                                     |
| //go:linkename [localname] [importpath.name] | 将localname链接到目标中，这可以将一些internal的方法导出来    |
| //go:build [tags]                            | 这个指令的旧语法是 `// +build [tags]`，用于指定 build tag，满足条件的时候才会构建，详细看 [build constraints](https://pkg.go.dev/cmd/go#hdr-Build_constraints) |
| //go:embed [patterns]                        | 嵌入内容（可以是单个文件、多个文件或者目录），详细看 [embed package](https://pkg.go.dev/embed) |
| //extern [extern name]                       | 指示导出的外部名                                             |
| //line [filename:line:col]                   | 修改当前的行号和列号（其中 `filename` 和 `col` 可以省略）    |
| // #cgo                                      | 可用于指示 `cgo` 的编译和链接开关，例如：// #cgo LDFLAGS: -lsocket -lnsl -lsendfile |
| //go:cgo_xxx_xxx                             | 包括上面那条，有一系列与 `cgo` 相关的编译指令，比如 `//go:cgo_import_dynamic`、`//go:cgo_dynamic_linker`，可以参考：[Command cgo](https://golang.google.cn/cmd/cgo/)、[C? Go? Cgo!](https://go.dev/blog/cgo) |
| //export [name]                              | 将 go 函数导出为 C，生成 `xxx_cgo_export.h` 文件             |

### //go:generate 例子

```go
//go:generate cmd /c "echo hello generate"

package main

func main() {
    
}
```

```bash
$ go generate
# 输出
# hello generate
```

### //go:linkname 例子

```go
package main

import (
	"fmt"
	_ "unsafe"
)

//go:linkname MyFastrand runtime.fastrand
func MyFastrand() uint32

func main() {
	fmt.Println(MyFastrand())
}
```

### //go:embed 例子

```txt
file: ./hello.txt

hello world
```

```go
package main

import (
	_ "embed"
	"fmt"
)

//go:embed hello.txt
var hello_info string

func main() {
	fmt.Println(hello_info)
}
```

```bash
$ go run .
# 输出
# hello world
```

## go build 构建参数

- `-gcflags '[pattern=]arg list'` 指定编译选项，`go build -gcflags -help` 查看详细帮助
- `-ldflags '[pattern=]arg list'` 指定链接选项，`go build -ldflags -help` 查看详细帮助

> 上面的 `pattern=` 是可选的，指的是针对的 `package` 类型，可以通过 `go help packages` 来查看，主要有：
>
> - main
> - std
> - cmd
> - all
>
> 如果不确定的话，可以不使用 `pattern=`，或者使用 `all=`

具体的 `arg` 细节就不列出来了，可以直接看 `help` 文档，这里给出几个常见的构建模式

```bash
# 禁止优化
# -N 禁止优化
# -l 禁止内联
go build -gcflags 'all=-N -l' .

# 禁用符号表和调试信息（默认是启用的）
# -s 禁用符号表
# -w 禁用DRAWF调试信息
go build -ldflags '-s -w' .
```

## cgo

>```bash
># 确保启用cgo
>go env -w CGO_ENABLED=1
>```

### 插入 C 代码

```go
package main

/*
#cgo CFLAGS: -std=c11

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void print(char* str)
{
	printf("%s\n", str);
}
*/
import "C"
import "unsafe"

func main() {
	cstr := C.CString("hello, cgo")
	defer C.free(unsafe.Pointer(cstr))
	C.print(cstr)
}
```

### 导出为 C 模块

```go
file: ./main.go

// 包名为example.com/tcgo
// 需要包含main包和main方法
package main

// #cgo CFLAGS: -std=c11
import "C"

import "fmt"

//export SayHello
func SayHello() {
	fmt.Println("hello, cgo")
}

func main() {
	
}
```

```c
file: ./ctest/main.c
    
#include "tcgo.h"

int main(int argc, char** argv)
{
    SayHello();
    return 0;
}
```

#### 静态模块

```bash
go build -buildmode=c-archive
# 项目根目录生成tcgo.a和tcgo.h文件

# 编译ctest
gcc ctest/main.c tcgo.a -I./ -o ct

# 运行
./ct
# 输出
# hello, cgo
```

#### 动态模块

```bash
go build -buildmode=c-shared -o tcgo.so
# 项目根目录生成tcgo.so和tcgo.h文件

# 编译ctest
gcc ctest/main.c -I./ -L./ ./tcgo.so -o ct

# 查看ct的依赖
readelf -d ct
# 输出
# Dynamic section at offset 0x2e00 contains 25 entries:
#   Tag        Type                         Name/Value
#  0x0000000000000001 (NEEDED)             Shared library: [./tcgo.so]
#  ...
#  ...

# 运行
./ct
# 输出
# hello, cgo
```


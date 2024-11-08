---
title: Docker Trick记录
tags:
  - Docker
  - Snippet
  - Trick
  - Best Practice
  - 最佳实践
categories:
  - - Docker
    - Practice
date: 2023-08-24 01:21:26
---


> 这篇文章会随时更新

# Build

## 合理利用multi-stage

multi-stage可以带来：

- 减少Image体积
- 并行构建
- 划分目标产出

下面以[官方guide中的例子](https://docs.docker.com/build/guide/multi-stage/)来逐步看这几个特性

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.20-alpine
WORKDIR /src
COPY go.mod go.sum .
RUN go mod download
COPY . .
RUN go build -o /bin/client ./cmd/client
RUN go build -o /bin/server ./cmd/server
ENTRYPOINT [ "/bin/server" ]
```

```bash
$ docker build --tag=buildme .
$ docker images buildme
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
buildme      latest    c021c8a7051f   5 seconds ago   150MB
```

以上是例子原始的dockerfile，这是一个Golang项目，它的产出 `/bin/client` 和 `/bin/server`，包含了客户端和服务端的目标可执行文件，入口点是 `/bin/server`，构造出来的镜像有 `150MB` ，由于这个镜像的最终产出只有client和server两个目标可执行文件，所以说这个镜像大小相对来说有些大了，包含了非必须的部分。

### 减少Image体积

```dockerfile
# syntax=docker/dockerfile:1
  FROM golang:1.20-alpine
  WORKDIR /src
  COPY go.mod go.sum .
  RUN go mod download
  COPY . .
  RUN go build -o /bin/client ./cmd/client
  RUN go build -o /bin/server ./cmd/server
+
+ FROM scratch
+ COPY --from=0 /bin/client /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

```bash
$ docker build --tag=buildme .
$ docker images buildme
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
buildme      latest    436032454dd8   7 seconds ago   8.45MB
```

每一个 `FROM` 代表了一个stage，上面加入的 `FROM scratch` 将其分为了两个stage，第一个stage负责编译 `client` 和 `server` ，第二个stage将产出从第一个stage拷贝过来，最终构建的image会保留最后一个的stage。从 `docker images buildme` 的输出可以看到，image的体积从 `150MB` 降到了 `8.45MB`。

### 并行构建

```dockerfile
# syntax=docker/dockerfile:1
- FROM golang:1.20-alpine
+ FROM golang:1.20-alpine AS base
  WORKDIR /src
  COPY go.mod go.sum .
  RUN go mod download
  COPY . .
+
+ FROM base AS build-client
  RUN go build -o /bin/client ./cmd/client
+
+ FROM base AS build-server
  RUN go build -o /bin/server ./cmd/server

+ FROM scratch
+ COPY --from=build-client /bin/client /bin/
+ COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

以上dockerfile有四个stage，**base** stage负责处理项目的依赖，**build-client** 和 **build-server** 这两个stage从 **base** stage继承而来（可以理解为面向对象中的父子类关系），它们分别负责构建 **client** 和 **server**，最后一个stage将从 **build-client** 和 **build-server** stage把目标产出拷贝过来。构造该image时，可以发现构建的速度加快了，而且 **build-client** 和 **build-server** 这两个stage的构造指令是**并行进行的**，**docker可以根据各个stage之间的依赖关系，让某些stage的构造并行执行**。

### 划分目标产出

```dockerfile
# syntax=docker/dockerfile:1
- FROM golang:1.20-alpine
+ FROM golang:1.20-alpine AS base
  WORKDIR /src
  COPY go.mod go.sum .
  RUN go mod download
  COPY . .
+
+ FROM base AS build-client
  RUN go build -o /bin/client ./cmd/client
+
+ FROM base AS build-server
  RUN go build -o /bin/server ./cmd/server

+ FROM scratch AS client
+ COPY --from=build-client /bin/client /bin/
+ ENTRYPOINT [ "/bin/client" ]

+ FROM scratch AS server
+ COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

上面有五个stage，对于 **base**、**build-client** 和 **build-server** stage已经在上一节中讲过了，主要看 **client** 和 **server** stage。从代码可以看出，它们分别代表了客户端和服务端的产出，并且有各自的 `ENTRYPOINT` 。在构造image的时候，可以通过指定 `--target` 参数来指定目标的stage。

```bash
$ docker build --tag=buildme-client --target=client .
$ docker build --tag=buildme-server --target=server .
$ docker images buildme 
REPOSITORY       TAG       IMAGE ID       CREATED          SIZE
buildme-client   latest    659105f8e6d7   20 seconds ago   4.25MB
buildme-server   latest    666d492d9f13   5 seconds ago    4.2MB
```

## 利用Cache Mount存储package cache

对于一些仅需要在 `Build` 阶段使用的依赖，这里说的依赖指通过包管理器下载的编译工具、三方库、临时文件等，可以使用 **Cache Mount** 将这些依赖的指定目录挂载起来，这样的话当添加新依赖或者该 `Layer` 的指令需要重新执行时，可以直接使用缓存中的内容，而不需要重新处理已存在 **Cache Mount** 中的依赖，合理利用可以加快 `Image` 的构建速度。

> 注意：**Cache Mount** 中的缓存只存在于 `Build` 阶段，当 `Image` 实例化为 `Container` 运行之后就不存在了，如果希望在运行阶段也可以使用的话，使用其他的方法，比如 **Bind Mount**。

以下是一个使用 **Cache Mount** 的例子，同样来自[官方的guide](https://docs.docker.com/build/guide/mounts/)

```dockerfile
# syntax=docker/dockerfile:1
  FROM golang:1.20-alpine
  WORKDIR /src
  COPY go.mod go.sum .
- RUN go mod download
+ RUN --mount=type=cache,target=/go/pkg/mod/ \
+     go mod download -x
  COPY . .
  RUN go build -o /bin/client ./cmd/client
  RUN go build -o /bin/server ./cmd/server
  ENTRYPOINT [ "/bin/server" ]
```

golang通过 `go get` 下载的 `mod` 默认位于 `$GOPATH/pkg/mod` 中（其中 `$GOPATH` 默认为 `/go`），上面将该目录使用 **Cache Mount** 挂载，要观察缓存是否生效的话，可以参考guide中以下的做法：

```bash
# 1. 清理构建缓存
$ docker builder prune -af

# 2. 重新执行构建，并将构建过程打印出来
$ docker build --progress=plain . 2> log1.txt
$ awk '/proxy.golang.org/' log1.txt
#11 0.168 # get https://proxy.golang.org/github.com/charmbracelet/lipgloss/@v/v0.6.0.mod
#11 0.168 # get https://proxy.golang.org/github.com/aymanbagabas/go-osc52/@v/v1.0.3.mod
#11 0.168 # get https://proxy.golang.org/github.com/atotto/clipboard/@v/v0.1.4.mod
#11 0.168 # get https://proxy.golang.org/github.com/charmbracelet/bubbletea/@v/v0.23.1.mod
#11 0.169 # get https://proxy.golang.org/github.com/charmbracelet/bubbles/@v/v0.14.0.mod
#11 0.218 # get https://proxy.golang.org/github.com/charmbracelet/bubbles/@v/v0.14.0.mod: 200 OK (0.049s)
#11 0.218 # get https://proxy.golang.org/github.com/aymanbagabas/go-osc52/@v/v1.0.3.mod: 200 OK (0.049s)
#11 0.218 # get https://proxy.golang.org/github.com/containerd/console/@v/v1.0.3.mod
#11 0.218 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.0.mod
#11 0.219 # get https://proxy.golang.org/github.com/charmbracelet/bubbletea/@v/v0.23.1.mod: 200 OK (0.050s)
#11 0.219 # get https://proxy.golang.org/github.com/atotto/clipboard/@v/v0.1.4.mod: 200 OK (0.051s)
#11 0.219 # get https://proxy.golang.org/github.com/charmbracelet/lipgloss/@v/v0.6.0.mod: 200 OK (0.051s)
...

# 3. 引入新的依赖包（以下命令将当前目录挂载进了容器并指定了workdir，所以在golang的容器内执行go get之后，新加入的依赖包的信息也会更新到宿主机的go.mod和go.sum中）
$ docker run -v $PWD:$PWD -w $PWD golang:1.20-alpine \
    go get github.com/go-chi/chi/v5@v5.0.8

# 4. 重新执行构建（可以看到仅下载了新加入的chi包）
$ docker build --progress=plain . 2> log2.txt
awk '/proxy.golang.org/' log2.txt
#10 0.143 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.mod
#10 0.190 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.mod: 200 OK (0.047s)
#10 0.190 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.info
#10 0.199 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.info: 200 OK (0.008s)
#10 0.201 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.zip
#10 0.209 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.zip: 200 OK (0.008s)
```

## 利用Bind Mount减少构造时的文件拷贝

对于仅在 `Build` 阶段使用，且已存在于宿主机的代码或配置等文件，可以通过 `Bind Mount` 来减少构建时文件拷贝的开销，这将直接使用宿主机上的文件。

```dockerfile
# syntax=docker/dockerfile:1
  FROM golang:1.20-alpine
  WORKDIR /src
- COPY go.mod go.sum .
- RUN go mod download
+ RUN --mount=type=bind,source=go.mod,target=go.mod \
      --mount=type=bind,source=go.sum,target=go.sum \
      go mod download -x
- COPY . .

- RUN go build -o /bin/client ./cmd/client
+ RUN --mount=type=bind,target=. \
+     go build -o /bin/client ./cmd/client

- RUN go build -o /bin/server ./cmd/server
+ RUN --mount=type=bind,target=. \
      go build -o /bin/server ./cmd/server

  ENTRYPOINT [ "/bin/server" ]
```

# Layer

## 情况允许时最好将拷贝代码的指令放在处理依赖之前

在Docker Image的构建过程中，一条或多条指令会被封装进一个Layer中（中间镜像层），理论上Layer的数目越少，构建的效率越高并且Image的体积会更小。另外对于当前指令的执行结果没有导致该Layer发生变化，那么可以使用Build Cache。否则包括当前Layer，后续的所有Layer都需要重新构建。

在情况允许时最好将拷贝代码的指令放在处理依赖之前，根据以下例子说明这样做的好处：

```dockerfile
COPY . .
RUN go mod download
```

以上是一个Golang项目的Dockerfile文件的部分内容，第一行是将项目代码拷贝进工作空间，第二行是处理项目的依赖。如果项目代码发生了变化，那么该Layer需要重新构建，不管项目的依赖有没有发生变化，之后的 `RUN go mod download ` Layer都会重新执行，这样就产生了没有必要的开销。

为了规避这个问题的一个比较好的做法就如标题所说，在编写Dockerfile时，**把处理依赖放在拷贝代码之前执行**。

由于这是一个Golang项目，针对性的可以这样修改Dockerfile：

```dockerfile
COPY go.mod go.sum .
RUN go mod download
COPY . .
```

# 时间

## alpine发行版改为上海时区

```dockerfile
RUN apk --update add tzdata && \
	cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
	echo 'Asia/Shanghai' > /etc/timezone

# 根据需要清理tzdata包和包缓存，安装tzdata包是为了拿里面得时区数据而已
RUN apk del tzdata && \
	rm -rf /var/cache/apk/*
```

# 配置

## 容器随着docker一起启动、重启

如果是在 `compose.yml` 内配置的话，可以：

```yaml
restart: always
```

直接更新容器的配置的话，可以：

```bash
docker update --restart=always <容器名>
```


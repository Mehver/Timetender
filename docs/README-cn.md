<div align="center">
    <img src="https://github.com/Mehver/Timetender/raw/main/docs/icon/256.png" width="20%"/>
    <h1>Timetender <code>v1.0.2</code></h1>
	<p><a href='https://github.com/Mehver/Timetender/blob/main/README.md'>English</a> | 简体中文</p>
	<a href='https://github.com/Mehver/Timetender'><img src="https://img.shields.io/badge/-GitHub-3A3A3A?style=flat&amp;logo=GitHub&amp;logoColor=white" referrerpolicy="no-referrer" alt="GitHub"></a>
	<a href='https://hub.docker.com/r/titanrgb/timetender'><img src="https://img.shields.io/badge/-DockerHub-1c90ed?style=flat&amp;logo=Docker&amp;logoColor=white" alt="DockerHub"></a>
	<a href='https://quay.io/repository/titanrgb/timetender'><img src="https://img.shields.io/badge/-Quay.io-ee0000?style=flat&amp;logo=RedHat&amp;logoColor=white" alt="Quay.io"></a>
</div>



## 1 项目介绍

使用 Vite + React 19 + TypeScript + MUI 编写的甘特图风格待办事项列表（`v1.0.0` 起完全重写）。

它遵循以下规则：

- x 轴为日历 (每列代表一天)，可无限滚动
- y 轴为任务列表 (每行仅包含一项任务)，可自由扩展

### 1.1 (弃用原型) Excel 概念版

<img src="https://github.com/Mehver/Timetender/raw/main/docs/0.png" width="50%">

### 1.2 当前项目

<table>
    <tr>
        <td><img src="https://github.com/Mehver/Timetender/raw/main/docs/A.png"/></td>
        <td><img src="https://github.com/Mehver/Timetender/raw/main/docs/B.png"/></td>
    </tr>
<tr>
        <td><img src="https://github.com/Mehver/Timetender/raw/main/docs/C.png"/></td>
        <td><img src="https://github.com/Mehver/Timetender/raw/main/docs/D.png"/></td>
    </tr>
</table>
## 2 使用说明

**构建 Docker 镜像：**

```shell
docker build -t timetender ./app
```

**运行 Docker 镜像：**

```shell
# DockerHub
docker pull titanrgb/timetender:latest
# GitHub
docker pull ghcr.io/mehver/timetender:latest
```

```shell
docker run -d \
  --name=timetender \
  -e TZ=Asia/Shanghai \
  -p 127.0.0.1:80:8080/tcp \
  -v /path/for/data:/usr/lib/timetender/data \
  timetender:latest
```

| 参数                                          | 功能说明                       |
| --------------------------------------------- | ------------------------------ |
| `-p 127.0.0.1:80:8080/tcp`                    | HTTP Web 界面                  |
| `-e TZ=Asia/Shanghai`                         | 指定时区                       |
| `-v /path/for/data:/usr/lib/timetender/data`  | 数据存储目录（JSON 文件）      |

打开 http://localhost，如需服务端持久化存储，请在设置中选择「**后端服务器存储**」(默认使用浏览器存储)。

---

**单文件构建（无需服务器）：**

```shell
cd app
pnpm install
pnpm build
```

然后直接在浏览器中打开 `dist/index.html`（支持 file:// 协议）。

## 3 开发指南

**环境要求**

- [Node.js](https://nodejs.org/en/) v24

**安装依赖**

```shell
cd app
pnpm install
```

**前端开发**

```shell
pnpm start &       # 可选：Express 后端，用于 /api/data 接口
pnpm dev
```

**前端编译**

```shell
pnpm build
```

**后端服务器**

```shell
pnpm start
```

**测试 / 类型检查**

```shell
pnpm test          # vitest 单元 + 冒烟测试
pnpm typecheck     # tsc -b
```

**构建 Docker 镜像**

```shell
pnpm install
pnpm build
docker build -t <YourID>/timetender:<tag> .
```

## 4 技术栈

> 本项目所使用的全部依赖均为开源组件，且均基于宽松许可协议（如 MIT、BSD、Apache）。未包含任何具有传染性（如 GPL、AGPL）授权条款的组件。

- Node.js
  - React 19 + Vite
    - Material UI v7 (https://github.com/mui/material-ui)
    - MUI X (https://github.com/mui/mui-x)
      - Data Grid
      - Date Pickers
  - Express 5 (https://github.com/expressjs/express)
- Docker
  - Node.js v24 镜像 (https://hub.docker.com/_/node)
    - `node:24-alpine`

## 5 许可证

本项目采用 BSD 3-Clause 协议开源发布。代码可以在注明出处的前提下自由使用与再发布。

本项目所使用的全部依赖均为开源组件，且均基于宽松许可协议（如 MIT、BSD、Apache）。未包含任何具有传染性（如 GPL、AGPL）授权条款的组件。

This project is released under the BSD 3-Clause License. Code may be reused with proper attribution.

Copyright (c) 2022 Mehver (https://github.com/Mehver). All rights reserved.

All dependencies are open-source and licensed under permissive licenses. No copyleft (e.g., GPL, AGPL) components are included.

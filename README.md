<div align="center">
    <img src="https://github.com/Mehver/Timetender/raw/main/docs/icon/256.png" width="20%"/>
    <h1>Timetender <code>v1.0.2</code></h1>
	<p>English | <a href='https://github.com/Mehver/Timetender/blob/main/docs/README-cn.md'>简体中文</a></p>
	<a href='https://github.com/Mehver/Timetender'><img src="https://img.shields.io/badge/-GitHub-3A3A3A?style=flat&amp;logo=GitHub&amp;logoColor=white" referrerpolicy="no-referrer" alt="GitHub"></a>
	<a href='https://hub.docker.com/r/titanrgb/timetender'><img src="https://img.shields.io/badge/-DockerHub-1c90ed?style=flat&amp;logo=Docker&amp;logoColor=white" alt="DockerHub"></a>
	<a href='https://quay.io/repository/titanrgb/timetender'><img src="https://img.shields.io/badge/-Quay.io-ee0000?style=flat&amp;logo=RedHat&amp;logoColor=white" alt="Quay.io"></a>
</div>



## 1 Description

A Gantt-style todo list, written with Vite + React 19 + TypeScript + MUI (completely rewrote for `v1.0.0`).

It follows these rules:

- x-axis is the calendar (each column is a date), so it's infinite
- y-axis is task list (each line contains only one task), expanding

### 1.1 (eliminated) Excel Concept

<img src="https://github.com/Mehver/Timetender/raw/main/docs/0.png" width="50%">

### 1.2 Now Project

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
## 2 Usage

**Build Docker Image:**

```shell
docker build -t timetender ./app
```

**Run Docker Image:**

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

| Parameter                                     | Function                           |
| --------------------------------------------- | ---------------------------------- |
| `-p 127.0.0.1:80:8080/tcp`                    | HTTP web interface                 |
| `-e TZ=Asia/Shanghai`                         | Specify a timezone                 |
| `-v /path/for/data:/usr/lib/timetender/data`  | Data storage directory (JSON file) |

Open http://localhost and choose "**后端服务器存储**" in Settings if you want server-side persistence (browser-local storage works out of the box too).

---

**Single-file build (no server needed):**

```shell
cd app
pnpm install
pnpm build
```

Then open `dist/index.html` directly in a browser (file:// works).

## 3 Development

**Requirements**

- [Node.js](https://nodejs.org/en/) v24

**Install Dependency**

```shell
cd app
pnpm install
```

**Frontend Development**

```shell
pnpm start &       # optional: Express backend for the /api/data endpoints
pnpm dev
```

**Frontend Compile**

```shell
pnpm build
```

**Backend Server**

```shell
pnpm start
```

**Tests / Typecheck**

```shell
pnpm test          # vitest unit + smoke tests
pnpm typecheck     # tsc -b
```

**Build Docker Image**

```shell
pnpm install
pnpm build
docker build -t <YourID>/timetender:<tag> .
```

## 4 Built With

> All dependencies are open-source and licensed under permissive licenses. No copyleft (e.g., GPL, AGPL) components are included.

- Node.js
  - React 19 + Vite
    - Material UI v7 (https://github.com/mui/material-ui)
    - MUI X (https://github.com/mui/mui-x)
      - Data Grid
      - Date Pickers
  - Express 5 (https://github.com/expressjs/express)
- Docker
  - Node.js v24 Image (https://hub.docker.com/_/node)
    - `node:24-alpine`

## 5 License

This project is released under the BSD 3-Clause License. Code may be reused with proper attribution.

Copyright (c) 2022 Mehver (https://github.com/Mehver). All rights reserved.

All dependencies are open-source and licensed under permissive licenses. No copyleft (e.g., GPL, AGPL) components are included.

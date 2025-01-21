<div align="center">
    <img src="https://github.com/Mehver/Timetender/raw/main/docs/icon/256.png" width="20%"/>
    <h1>Timetender <code>v0.1.4</code></h1>
	<a href='https://github.com/Mehver/Timetender'><img src="https://img.shields.io/badge/-GitHub-3A3A3A?style=flat&amp;logo=GitHub&amp;logoColor=white" referrerpolicy="no-referrer" alt="GitHub"></a>
	<a href='https://hub.docker.com/r/titanrgb/timetender'><img src="https://img.shields.io/badge/-DockerHub-1c90ed?style=flat&amp;logo=Docker&amp;logoColor=white" referrerpolicy="no-referrer" alt="DockerHub"></a>
	<a href='https://quay.io/repository/titanrgb/timetender'><img src="https://img.shields.io/badge/-Quay.io-ee0000?style=flat&amp;logo=RedHat&amp;logoColor=white" referrerpolicy="no-referrer" alt="Quay.io"></a>
    </tr>
</div>

## 1 Description

During my high school, I use Excel as a todo list to manage my tasks such as homework. It's time to make a more powerful
version by React.

It follows these rules:

- x-axis is the calendar (each column is a date), so it's infinite
- y-axis is task list (each line contain only one task), expanding

And with classifying by color and tags, it can be more powerful.

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

```shell
# DockerHub
docker pull titanrgb/timetender:latest
# GitHub
docker pull ghcr.io/mehver/timetender:latest
# Quay.io
docker pull quay.io/titanrgb/timetender:latest
```

```shell
docker run -d \
  --name=timetender \
  -e TZ=Asia/Shanghai \
  -p 127.0.0.1:80:8080/tcp \
  -v /path/to/config:/usr/lib/timetender/config \
  -v /path/for/data:/usr/lib/timetender/data \
  titanrgb/timetender:latest
```

| Parameter                                       | Function                        |
| ----------------------------------------------- | ------------------------------- |
| `-p 127.0.0.1:80:8080/tcp`                      | Http webUI                      |
| `-e TZ=Asia/Shanghai`                           | Specify a timezone              |
| `-v /path/to/config:/usr/lib/timetender/config` | Timetender's configuration directory |
| `-v /path/for/data:/usr/lib/timetender/data`    | Timetender's data storage directory       |

## 3 Development

**Requirements**

- [Node.js](https://nodejs.org/en/) v16.16.0
- [Docker](https://www.docker.com/) v20.10.17

**Install Dependency**

```shell
npm install --legacy-peer-deps
npm run build
```

**Frontend Development**

```shell
npm run react
```

**Frontend Compile**

```shell
npm run build
```

**Backend Server**

```shell
npm start
```

**Build Docker Image**

```shell
npm install --legacy-peer-deps
npm run build
docker build -t <YourID>/timetender:<tag> .
```


## 4 Built With

- Node.js
  - React.js
    - Luckysheet (https://github.com/mengshukeji/Luckysheet)
    - Material UI (https://github.com/mui/material-ui)
    - Ant Design (https://github.com/ant-design/ant-design)
    - Json Editor (https://github.com/josdejong/jsoneditor)
  - Express.js
- Docker
  - Node.js v16 Image (https://hub.docker.com/_/node) 
    - `node:16-alpine3.16`

## 5 Reference

- [GitHub@mengshukeji/Luckysheet](https://github.com/mengshukeji/Luckysheet)
  - https://dream-num.github.io/LuckysheetDocs/zh/guide/config.html
  - https://dream-num.github.io/LuckysheetDocs/zh/guide/api.html
- [GitHub@mengshukeji/luckysheet-react](https://github.com/mengshukeji/luckysheet-react)
- [GitHub@mui/material-ui](https://github.com/mui/material-ui)
  - https://mui.com/zh/material-ui/react-table/
- [GitHub@ant-design/ant-design](https://github.com/ant-design/ant-design)
  - https://ant.design/components/icon/
- [GitHub@josdejong/jsoneditor](https://github.com/josdejong/jsoneditor)
  - https://github.com/josdejong/jsoneditor/tree/master/examples/react_demo

## 6 License

MPL 2.0

Copyright © 2022-PRESENT GitHub@Mehver/Timetender , All Rights Reserved.

<div align="center">
    <img src="https://github.com/TitanRGB/Timetender/raw/main/%23README/icon/256.png" width="20%"/>
    <h1>Time Tender <code>v0.1.0</code></h1>
	<a href='https://github.com/TitanRGB/Timetender'><img src="https://img.shields.io/badge/-GitHub-3A3A3A?style=flat&amp;logo=GitHub&amp;logoColor=white" referrerpolicy="no-referrer" alt="GitHub"/>
	<a href='https://hub.docker.com/r/titanrgb/timetender'><img src="https://img.shields.io/badge/-DockerHub-1c90ed?style=flat&amp;logo=Docker&amp;logoColor=white" referrerpolicy="no-referrer" alt="DockerHub"/>
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

<img src="https://github.com/TitanRGB/Timetender/raw/main/%23README/0.png" width="50%">

### 1.2 Now Project

<table>
    <tr>
        <td><img src="https://github.com/TitanRGB/Timetender/raw/main/%23README/A.png"/></td>
        <td><img src="https://github.com/TitanRGB/Timetender/raw/main/%23README/B.png"/></td>
    </tr>
<tr>
        <td><img src="https://github.com/TitanRGB/Timetender/raw/main/%23README/C.png"/></td>
        <td><img src="https://github.com/TitanRGB/Timetender/raw/main/%23README/D.png"/></td>
    </tr>
</table>

## 2 Usage & Development

### 2.1 Docker

https://hub.docker.com/r/titanrgb/timetender

### 2.2 Node.js

#### 2.2.1 Requirements

[Node.js](https://nodejs.org/en/) v16.16.0

#### 2.2.2 Installation

```bash
npm install --legacy-peer-deps
```

#### 2.2.3 Start Server

```bash
npm start
```

#### 2.2.4 Frontend Development

```bash
npm run react
```

#### 2.2.5 Frontend Compile

```bash
npm run build
```

## 3 Built With

- Node.js
    - React.js
        - Luckysheet (https://github.com/mengshukeji/Luckysheet)
        - Material UI (https://github.com/mui/material-ui)
        - Ant Design (https://github.com/ant-design/ant-design)
        - Json Editor (https://github.com/josdejong/jsoneditor)
    - Express.js

## 4 Reference

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

## 5 License

MPL 2.0

Copyright © 2022-PRESENT GitHub@TitanRGB/Timetender , All Rights Reserved.
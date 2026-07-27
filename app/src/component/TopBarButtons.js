// export to ./src/App.js

import React from 'react';
import * as icons from '@ant-design/icons';
import * as CSS from './TopBarButtonsCss';

class TopBarButtons extends React.Component {

    componentDidMount() {
        const luckysheet = window.luckysheet;

        // get the current hostname
        let host = window.location.hostname;
        // get the current port number
        let port = window.location.port;

        let save = function (filename) {
            let data = luckysheet.getAllSheets();
            // send data by ajax
            let xhr = new XMLHttpRequest();
            let url = "http://" + host + ":" + port + "/save/" + filename + ".json";
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
            xhr.send(JSON.stringify(data));
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log(xhr.responseText);
                }
            };
        };

        let load = function (filename) {
            let url = "http://" + host + ":" + port + "/load/" + filename + ".json";
            const luckysheet = window.luckysheet;
            luckysheet.create({
                container: 'luckysheet', // 设定DOM容器的id
                title: 'Luckysheet Demo', // 设定表格名称
                lang: 'zh', // 设定表格语言
                allowCopy: true, // 是否允许复制
                showinfobar: false, // 是否显示信息栏
                showtoolbar: false, // 是否显示工具栏
                showsheetbar: false, // 是否显示工作表栏
                sheetFormulaBar: false, // 是否显示工作表公式栏
                loadUrl: url, // 设定数据加载地址
                // defaultRowHeight: 48, // 默认行高
            });
        };

        let pressButtonEffect = function (buttonId) {
            let button = document.getElementById(buttonId);
            button.style.backgroundColor = "#abc";
            setTimeout(function () {
                button.style.backgroundColor = "#fff";
            }, 100);
        };

        // undo load button
        document.getElementById("toolbar-undoLoad").addEventListener("click", function () {
            pressButtonEffect("toolbar-undoLoad");
            save("data");
            load("data_auto-save");
        });

        // redo load button
        document.getElementById("toolbar-redoLoad").addEventListener("click", function () {
            pressButtonEffect("toolbar-redoLoad");
            load("data");
        });

        // save button
        document.getElementById("toolbar-save").addEventListener("click", function () {
            pressButtonEffect("toolbar-save");
            save("data");
        });

        // undo ctrlZ button
        document.getElementById("toolbar-ctrlZ").addEventListener("click", function () {
            pressButtonEffect("toolbar-ctrlZ");
            luckysheet.undo();
        });

        // redo ctrlY button
        document.getElementById("toolbar-ctrlY").addEventListener("click", function () {
            pressButtonEffect("toolbar-ctrlY");
            luckysheet.redo();
        });

        // set button
        document.getElementById("toolbar-set").addEventListener("click", function () {
            pressButtonEffect("toolbar-set");
        });
    }

    render() {
        return (
            <>
                <div id="buttonBar" style={CSS.barCss}>
                    <button id="toolbar-undoLoad" style={CSS.buttonCss}>
                        <icons.UndoOutlined style={CSS.iconCss}/>
                    </button>
                    <button id="toolbar-save" style={CSS.buttonCss}>
                        <icons.SaveOutlined style={CSS.iconCss}/>
                    </button>
                    <button id="toolbar-redoLoad" style={CSS.buttonCss}>
                        <icons.RedoOutlined style={CSS.iconCss}/>
                    </button>
                    <button id="toolbar-ctrlZ" style={CSS.buttonCss}>
                        <icons.CaretLeftOutlined style={CSS.iconCss}/>
                    </button>
                    <button id="toolbar-ctrlY" style={CSS.buttonCss}>
                        <icons.CaretRightOutlined style={CSS.iconCss}/>
                    </button>
                    <button id="toolbar-list" style={CSS.buttonCss}>
                        <icons.UnorderedListOutlined style={CSS.iconCss}/>
                    </button>
                    <button id="toolbar-set" style={CSS.buttonCss}>
                        {/*<icons.SettingOutlined style={CSS.iconCss}/>*/}
                        <icons.InfoCircleOutlined style={CSS.iconCss}/>
                    </button>
                </div>
            </>
        )
    };
}

export default TopBarButtons;
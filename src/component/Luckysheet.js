// export to ./src/App.js

import React from 'react';
import LuckysheetRenderData from './Luckysheet-RenderData';

class Luckysheet extends React.Component {

    componentDidMount() {
        const luckysheet = window.luckysheet;

        // get the current hostname
        let host = window.location.hostname;
        // get the current port number
        let port = window.location.port;
        let url = "http://" + host + ":" + port + "/load/data.json";
        let options;
        options = {
            container: 'luckysheet', // 设定DOM容器的id
            title: 'Luckysheet Demo', // 设定表格名称
            lang: 'zh', // 设定表格语言
            allowCopy: true, // 是否允许复制
            showinfobar: false, // 是否显示信息栏
            showtoolbar: false, // 是否显示工具栏
            showsheetbar: false, // 是否显示工作表栏
            sheetFormulaBar: false, // 是否显示工作表公式栏
            // defaultRowHeight: 48, // 默认行高
        };
        // if port is 3000 (React dev), do not loadUrl
        if (port !== "3000") {
            options["loadUrl"] = url; // 设定数据加载地址
        }
        luckysheet.create(options);
    };

    render() {
        const luckysheetCss = {
            margin: 0,
            padding: 0,
            position: 'fixed',
            left: 0,
            top: 30,
            width: '100%',
            height: window.innerHeight - 30,
        }
        return (
            <>
                <div id="luckysheet" style={luckysheetCss}/>
                <LuckysheetRenderData/>
            </>
        )
    };
}

export default Luckysheet;

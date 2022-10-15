// 【备注001】 暂时将 "addEvent" 功能的组件用于编辑全部事件

import React from 'react';
import * as CSS from "./Windows-EditJsonCss";

import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import './modify/jsoneditor.css';

import {getRows, getTags, setRows, setTags} from './EventLogData';

export default class EditEventJson extends React.Component {

    componentDidMount() {
        const options = {
            mode: 'code',
        };
        let jsoneditor = window.jsoneditor = new JSONEditor(this.container, options);
        jsoneditor.set(getRows());
        let sw = true;

        document.querySelector("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu > a").style.display = "none";
        document.querySelector("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu").style.backgroundColor = "#eee";
        document.querySelector("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu").style.borderBottom = "#eee";
        let buttons = function (selector) {
            document.querySelector(selector).style.border = "1px solid #abc";
            document.querySelector(selector).style.backgroundColor = "#abc";
        }
        buttons("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu > button:nth-child(1)");
        buttons("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu > button:nth-child(2)");
        buttons("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu > button:nth-child(3)");
        buttons("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu > button:nth-child(4)");
        buttons("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu > button:nth-child(5)");
        buttons("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu > button:nth-child(6)");
        buttons("#popWindow_addEvent_editor > div > div > div.jsoneditor-menu > button:nth-child(7)");

        document.getElementById("editJson_buttonBarSave").addEventListener("click", function () {
            CSS.pressButtonEffect("editJson_buttonBarSave");
            if (sw) {
                setRows(jsoneditor.get());
            } else {
                setTags(jsoneditor.get());
            }
            window.windowsList_refreshRender();
        });

        document.getElementById("editJson_buttonBarSwitch").addEventListener("click", function () {
            CSS.pressButtonEffect("editJson_buttonBarSwitch");
            if (sw) {
                jsoneditor.set(getTags());
                sw = false;
            } else {
                jsoneditor.set(getRows());
                sw = true;
            }
        });
    }

    render() {
        return (
            <div id="popWindow_addEvent_editor" style={CSS.tableCss}>
                <div
                    className="jsoneditor"
                    ref={elem => this.container = elem}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
        )
    };
}
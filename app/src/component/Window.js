import React from 'react';
import * as CSS from "./WindowCss";
import * as icons from "@ant-design/icons";
import List from "./Windows-EventList";
import Setting from "./Windows-Setting";
import EditEventJson from "./Windows-EditJson";

class ButtonBar_Window extends React.Component {

    componentDidMount() {
        // for listWindow
        document.getElementById("toolbar-list").addEventListener("click", function () {
            CSS.pressButtonEffect("toolbar-list");
            document.getElementById("popWindow_listWindow").style.display = "block";
        });
        document.getElementById("listWindow_buttonBarClose").addEventListener("click", function () {
            CSS.pressButtonEffect("listWindow_buttonBarClose");
            document.getElementById("popWindow_listWindow").style.display = "none";
        });

        // for jsonEditor
        document.getElementById("listWindow_buttonBarJsonEditor").addEventListener("click", function () {
            CSS.pressButtonEffect("listWindow_buttonBarJsonEditor");
            document.getElementById("popWindow_jsonEditor").style.display = "block";
        });
        document.getElementById("editJson_buttonBarClose").addEventListener("click", function () {
            CSS.pressButtonEffect("editJson_buttonBarClose");
            document.getElementById("popWindow_jsonEditor").style.display = "none";
        });

        // for settingWindow
        document.getElementById('toolbar-set').addEventListener('click', function () {
            CSS.pressButtonEffect('toolbar-set');
            document.getElementById('popWindow_settingWindow').style.display = 'block';
        });
        document.getElementById('settingWindow_buttonBarClose').addEventListener('click', function () {
            CSS.pressButtonEffect('settingWindow_buttonBarClose');
            document.getElementById('popWindow_settingWindow').style.display = 'none';
        });
    }

    render() {
        return (
            <>
                <div id="popWindow_listWindow" style={CSS.popWindow}>
                    <div id="listWindow_buttonBar" style={CSS.listWindow_buttonBarCss}>
                        <button id="listWindow_buttonBarRender" style={CSS.buttonCss}>
                            <icons.VerticalAlignBottomOutlined style={CSS.iconCss}/>
                        </button>
                        <button id="listWindow_buttonBarJsonEditor" style={CSS.buttonCss}>
                            {/*<icons.PlusOutlined style={CSS.iconCss}/>*/}
                            <icons.EditOutlined style={CSS.iconCss}/>
                        </button>
                        <button id="listWindow_buttonBarClose" style={CSS.buttonCss}>
                            <icons.CloseOutlined style={CSS.iconCss}/>
                        </button>
                    </div>
                    <div id="listWindow_list">
                        <List/>
                    </div>
                </div>
                <div id="popWindow_settingWindow" style={CSS.popWindow}>
                    <div id="settingWindow_buttonBar" style={CSS.listWindow_buttonBarCss}>
                        <button id="settingWindow_buttonBarClose" style={CSS.buttonCss}>
                            <icons.CloseOutlined style={CSS.iconCss}/>
                        </button>
                    </div>
                    <div id="settingWindow_body">
                        <Setting/>
                    </div>
                </div>
                <div id="popWindow_jsonEditor" style={
                    {
                        ...CSS.popWindow,
                        zIndex: 50,
                    }
                }>
                    <div id="popWindow_editJson_buttonBar" style={CSS.listWindow_buttonBarCss}>
                        <button id="editJson_buttonBarSave" style={CSS.buttonCss}>
                            <icons.SaveOutlined style={CSS.iconCss}/>
                        </button>
                        <button id="editJson_buttonBarSwitch" style={CSS.buttonCss}>
                            <icons.SwapOutlined style={CSS.iconCss}/>
                        </button>
                        <button id="editJson_buttonBarClose" style={CSS.buttonCss}>
                            <icons.CloseOutlined style={CSS.iconCss}/>
                        </button>
                    </div>
                    <EditEventJson/>
                </div>
                <div id="popWindow_loading" style={
                    {
                        ...CSS.popWindow,
                        zIndex: 100,
                    }
                }>
                    <div id="loading_info" style={CSS.loading_infoCss}>
                        <icons.LoadingOutlined style={CSS.loading_iconCss}/>
                        <br/>
                        <p>loading</p>
                    </div>
                </div>
            </>
        )
    };
}

export default ButtonBar_Window;
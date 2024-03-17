import * as React from 'react';

import * as CSS from './Windows-SettingCss';

export default class Setting extends React.Component {

    componentDidMount() {}

    render() {
        let imgUrl = function () {
            // get the current hostname
            let host = window.location.hostname;
            // get the current port number
            let port = window.location.port;
            if (port === '3000') {
                port = '8080';
            }
            let url = "http://" + host + ":" + port + "/256.png";
            return url;
        };
        return (
            <>
                <div style={CSS.settingBodyCss}>
                    <img
                        src={imgUrl()}
                        style={{
                            border: '5px solid #fff',
                            backgroundColor: '#fff',
                        }}
                    />
                    <p style={{fontSize: 25}}>Timetender v0.1.2</p>
                    <p style={{fontSize: 20}}>GitHub@Mehver</p>
                    <p style={{fontSize: 10}}>https://github.com/Mehver/Timetender</p>
                    <p style={{fontSize: 15}}>Copyright © 2022-present Timetender</p>
                </div>
            </>
        );
    }
}
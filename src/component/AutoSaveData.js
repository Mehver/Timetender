// export to ./src/App.js

import React from 'react';

class AutoSaveData extends React.Component {

    componentDidMount() {
        const luckysheet = window.luckysheet;
        // get the current hostname
        let host = window.location.hostname;
        // get the current port number
        let port = window.location.port;
        // if port is 3000 (React dev), do not run this script
        if (port !== "3000") {
            // run the save function every 5 seconds
            setInterval(function () {
                let data = luckysheet.getAllSheets();
                // send data by ajax
                let xhr = new XMLHttpRequest();
                xhr.open("POST", "http://" + host + ":" + port + "/save/data_auto-save.json", true);
                xhr.setRequestHeader("Content-Type", "text/plain; charset=utf-8");
                xhr.send(JSON.stringify(data));
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        console.log(xhr.responseText);
                    }
                };
            }, 3000);
        }
    };

    render() {
        return (
            <></>
        );
    };
}

export default AutoSaveData;
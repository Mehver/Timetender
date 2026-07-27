export function getRows() {
    // get the current hostname
    let host = window.location.hostname;
    // get the current port number
    let port = window.location.port;

    // get event.json by ajax, return json object
    let xhr = new XMLHttpRequest();
    let url = "http://" + host + ":" + port + "/load/" + "event.json";
    xhr.open("get", url, false);
    xhr.send(null);
    let error_return = [
        {
            "id": 1,
            "title": "error1",
            "start": "2021-07-01",
            "ddl": "2021-07-10 00:00:00",
            "tags": [
                {
                    "id": 1
                },
                {
                    "id": 2
                }
            ],
            "color": "#ff0000",
            "description": "error 1 description",
            "history": [
                {
                    "time": "2022-10-01 00:00:00",
                    "status": "begin"
                },
                {
                    "time": "2022-10-05 00:00:00",
                    "status": "done a half"
                }
            ],
            "finished": false
        },
        {
            "id": 2,
            "title": "error2",
            "start": "2021-07-05 00:10:00",
            "ddl": "2021-07-12 00:10:00",
            "tags": [
                {
                    "id": 3
                }
            ],
            "color": "#ff5500",
            "description": "error 2 description",
            "history": [
                {
                    "time": "2022-10-01 00:00:00",
                    "status": "begin"
                },
                {
                    "time": "2022-10-05 00:00:00",
                    "status": "done a half"
                },
                {
                    "time": "2022-10-05 00:00:00",
                    "status": "finish"
                }
            ],
            "finished": true
        },
        {
            "id": 3,
            "title": "error3",
            "start": "2021-07-06 00:10:00",
            "ddl": "2021-07-08 00:10:00",
            "tags": [
                {
                    "id": 3
                },
                {
                    "id": 4
                },
                {
                    "id": 2
                }
            ],
            "color": "#ff0088",
            "description": "error 3 description",
            "history": [
                {
                    "time": "2022-10-01 00:00:00",
                    "status": "begin"
                }
            ],
            "finished": true
        },
        {
            "id": 4,
            "title": "error4",
            "start": "2021-07-07 00:10:00",
            "ddl": "2021-07-12 00:10:00",
            "tags": [
                {
                    "id": 1
                },
                {
                    "id": 2
                },
                {
                    "id": 3
                },
                {
                    "id": 4
                }
            ],
            "color": "#aba",
            "description": "error 4 description",
            "history": [],
            "finished": false
        }
    ];
    if (xhr.readyState === 4 && xhr.status === 200) {
        try {
            return JSON.parse(xhr.responseText);
        } catch (e) {
            return error_return;
        }
    } else {
        return error_return;
    }
}

export function setRows(data) {
    // get the current hostname
    let host = window.location.hostname;
    // get the current port number
    let port = window.location.port;

    // set event.json by ajax, return json object
    let xhr = new XMLHttpRequest();
    let url = "http://" + host + ":" + port + "/save/" + "event.json";
    xhr.open("post", url, false);
    xhr.send(JSON.stringify(data));
    if (xhr.readyState === 4 && xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    } else {
        return false;
    }
}

export function getTags() {
    // get the current hostname
    let host = window.location.hostname;
    // get the current port number
    let port = window.location.port;

    // get event.json by ajax, return json object
    let xhr = new XMLHttpRequest();
    let url = "http://" + host + ":" + port + "/load/" + "tag.json";
    xhr.open("get", url, false);
    xhr.send(null);
    let error_return = [
        {
            "id": 1,
            "color": "#00ffff",
            "type": "error",
            "tag": "error tag 1"
        },
        {
            "id": 2,
            "color": "#ffff00",
            "type": "error",
            "tag": "error tag 2"
        },
        {
            "id": 3,
            "color": "#321234",
            "type": "error",
            "tag": "error tag 3"
        },
        {
            "id": 4,
            "color": "#00ff00",
            "type": "error",
            "tag": "error tag 4"
        }
    ];
    if (xhr.readyState === 4 && xhr.status === 200) {
        try {
            return JSON.parse(xhr.responseText);
        } catch (e) {
            return error_return;
        }
    } else {
        return error_return;
    }
}

export function setTags(data) {
    // get the current hostname
    let host = window.location.hostname;
    // get the current port number
    let port = window.location.port;

    // set event.json by ajax, return json object
    let xhr = new XMLHttpRequest();
    let url = "http://" + host + ":" + port + "/save/" + "tag.json";
    xhr.open("post", url, false);
    xhr.send(JSON.stringify(data));
    if (xhr.readyState === 4 && xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    } else {
        return false;
    }
}
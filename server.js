const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const PORT = 8080;

let bodyParser = require('body-parser') ;
app.use(bodyParser.text());

app.use(express.static("build"));

app.all("/load/:json_file", (req, res) => {
    let data = fs.readFileSync(
        path.join(__dirname, "/data", req.params.json_file)
    );
    res.send(data);
});

// save data to data.json
app.post("/save/:json_file", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let data = req.body;
    fs.writeFileSync(
        path.join(__dirname, "/data", req.params.json_file),
        data
    );
    res.send(data);
});

app.listen(PORT, function () {
    console.log("Express server listening on port ", PORT);
});
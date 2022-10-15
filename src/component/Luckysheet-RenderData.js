// export to ./src/App.js

import React from 'react';
import {getRows, getTags} from './EventLogData';
import {pressButtonEffect} from "./ButtonCss";

class LuckysheetRenderData extends React.Component {

    componentDidMount() {
        const luckysheet = window.luckysheet;
        document.getElementById("listWindow_buttonBarRender").addEventListener("click", function () {
            pressButtonEffect("listWindow_buttonBarRender");
            document.getElementById("popWindow_loading").style.display = "block";

            luckysheet.setSheetDelete();
            luckysheet.setSheetAdd();

            let rows = getRows();
            let tags = getTags();

            // find the start date and end date
            let startDateStr = rows[0].start.substring(0, 10);
            let endDateStr = rows[rows.length - 1].ddl.substring(0, 10);
            for (let i = 0; i < rows.length; i++) {
                if (new Date(rows[i].start.substring(0, 10)) < new Date(startDateStr)) {
                    startDateStr = rows[i].start.substring(0, 10);
                }
                if (new Date(rows[i].ddl.substring(0, 10)) > new Date(endDateStr)) {
                    endDateStr = rows[i].ddl.substring(0, 10);
                }
            }

            // calculate the number of days passed to Integer
            let days = (new Date(endDateStr) - new Date(startDateStr)) / (1000 * 60 * 60 * 24);

            let date;
            let dateStr;

            // pause a bit to make sure the loading animation is displayed
            setTimeout(function () {

                // add more rows if needed
                for (let i = 0; i < rows.length; i++) {
                    if (i >= 83) {
                        luckysheet.insertRow(i + 1);
                    }
                }

                // add more columns if needed
                for (let i = 0; i < days; i++) {
                    if (i >= 59) {
                        luckysheet.insertColumn(i + 1);
                    }
                }

                // draw the calendar line
                for (let i = 0; i < days + 1; i++) {
                    date = new Date(startDateStr);
                    date.setDate(date.getDate() + i);
                    dateStr = `${date.getFullYear()}`.substring(2, 4) + "." + (date.getMonth() + 1) + "." + date.getDate();
                    luckysheet.setCellValue(rows.length, i, dateStr);
                    luckysheet.setCellFormat(rows.length, i, "bg", "#abc");
                    luckysheet.setCellFormat(rows.length, i, "fc", "#fff");
                    luckysheet.setCellFormat(rows.length, i, "vt", 0);
                    luckysheet.setCellFormat(rows.length, i, "ht", 0);
                    luckysheet.setCellFormat(rows.length, i, "ff", 4);
                    luckysheet.setCellFormat(rows.length, i, "fs", 10);

                    // check if it is a weekend
                    if (date.getDay() === 0 || date.getDay() === 6) {
                        for (let j = 0; j < rows.length + 1; j++) {
                            luckysheet.setCellFormat(j, i, "bg", "#abc");
                            luckysheet.setCellFormat(j, i, "vt", 0);
                            luckysheet.setCellFormat(j, i, "ff", 4);
                            luckysheet.setCellFormat(j, i, "fs", 10);
                        }
                    }
                }

                let sameDayEndCounter = {};

                let rowDaysL;
                let rowDays;
                let tagsCell_sameDayEndCounter;
                let tagsCell_rowDaysL;
                let tagsCell_rowDays;

                let textColor = function (color) {
                    let redValue;
                    let greenValue;
                    let blueValue;
                    if (color.length === 7) {
                        redValue = color.substring(1, 3);
                        greenValue = color.substring(3, 5);
                        blueValue = color.substring(5, 7);
                    } else {
                        redValue = color.substring(1, 2);
                        greenValue = color.substring(2, 3);
                        blueValue = color.substring(3, 4);
                    }
                    let textColor = "#000000";
                    if (parseInt(redValue, 16) + parseInt(greenValue, 16) + parseInt(blueValue, 16) < 255) {
                        textColor = "#ffffff";
                    }
                    return textColor;
                }

                // draw events lines
                for (let i = 0; i < rows.length; i++) {
                    let rowStartDateStr = rows[i].start.substring(0, 10);
                    let rowEndDateStr = rows[i].ddl.substring(0, 10);
                    rowDaysL = (new Date(rowStartDateStr) - new Date(startDateStr)) / (1000 * 60 * 60 * 24);
                    rowDays = (new Date(rowEndDateStr) - new Date(rowStartDateStr)) / (1000 * 60 * 60 * 24);

                    let cl = 1;
                    let bl = 0;
                    let v = "finish";
                    if (!rows[i].finished) {
                        cl = 0;
                        bl = 1;
                        v = "working";
                    }

                    // start date cell
                    let startDateCell = function (row, col) {
                        let tagS = [];
                        rows[i].tags.map((tag) => {
                            tags.map((tags) => {
                                if (tag.id === tags.id) {
                                    tagS.push({
                                        ff: "\"times new roman\"",
                                        fc: tags.color,
                                        fs: 13,
                                        cl: 0,
                                        un: 0,
                                        bl: 0,
                                        it: 0,
                                        v: "●",
                                    });
                                }
                            });
                        });
                        if (tagS === []) {
                            tagS.push({
                                ff: "\"times new roman\"",
                                fs: 13,
                                cl: 0,
                                un: 0,
                                bl: 0,
                                it: 0,
                                v: "no_tag",
                                fc: textColor(rows[i].color),
                            });
                        }
                        luckysheet.setCellFormat(row, col, "ct", {
                            fa: "@",
                            t: "inlineStr",
                            s: [
                                {
                                    ff: "\"times new roman\"",
                                    v: `${rows[i].title}` + "\r\n",
                                    cl: cl,
                                    bl: bl,
                                    fc: textColor(rows[i].color),
                                },
                                ...tagS,
                            ],
                        });
                        luckysheet.setCellFormat(row, col, "vt", 0);
                        luckysheet.setCellFormat(row, col, "ht", 0);
                        luckysheet.setCellFormat(row, col, "tb", 2);
                        luckysheet.setRowHeight({[row]: 27.5});
                    }
                    startDateCell(i, rowDaysL);

                    // the bottom cells
                    if (sameDayEndCounter[rowDaysL + rowDays] === undefined) {
                        sameDayEndCounter[rowDaysL + rowDays] = 1;
                    }
                    startDateCell(rows.length + sameDayEndCounter[rowDaysL + rowDays], rowDaysL + rowDays);
                    luckysheet.setCellFormat(rows.length + sameDayEndCounter[rowDaysL + rowDays], rowDaysL + rowDays, "bg", rows[i].color);
                    sameDayEndCounter[rowDaysL + rowDays]++;

                    // passing empty color cells
                    for (let j = 0; j < rowDaysL + rowDays + 1; j++) {
                        if (j >= rowDaysL) {
                            luckysheet.setCellFormat(i, j, "bg", rows[i].color);
                        }
                    }

                    // end date cell
                    let endDateCell = function (row, col) {
                        luckysheet.setCellFormat(row, col, "ct", {
                            fa: "@",
                            t: "inlineStr",
                            s: [
                                {
                                    ff: "\"times new roman\"",
                                    v: `${rows[i].title}` + "\r\n",
                                    cl: cl,
                                    bl: bl,
                                    fc: textColor(rows[i].color),
                                },
                                {
                                    ff: "\"times new roman\"",
                                    v: v,
                                    it: 1,
                                    fc: textColor(rows[i].color),
                                },
                            ],
                        });
                        luckysheet.setCellFormat(row, col, "vt", 0);
                        luckysheet.setCellFormat(row, col, "ht", 0);
                        luckysheet.setCellFormat(row, col, "ff", 4);
                    }
                    endDateCell(i, rowDaysL + rowDays);

                    // tags cell
                    let tagsCell = function (row, col, jj) {
                        luckysheet.setCellFormat(row, col, "ct", {
                            fa: "@",
                            t: "inlineStr",
                            s: [
                                {
                                    ff: "\"times new roman\"",
                                    fs: 8,
                                    cl: 0,
                                    un: 0,
                                    bl: 0,
                                    it: 0,
                                    v: "▦ ",
                                    fc: tags[jj].color,
                                },
                                {
                                    ff: "\"times new roman\"",
                                    v: `${tags[jj].tag}\r\n`,
                                    fs: 9,
                                    fc: "#abc",
                                },
                                {
                                    ff: "\"times new roman\"",
                                    v: `${tags[jj].type}`,
                                    fs: 10,
                                    fc: "#abc",
                                    bl: 1,
                                },
                            ],
                        });
                        luckysheet.setCellFormat(row, col, "vt", 0);
                        luckysheet.setCellFormat(row, col, "ht", 0);
                        luckysheet.setCellFormat(row, col, "ff", 4);
                        luckysheet.setCellFormat(row, col, "fs", 10);
                        luckysheet.setRowHeight({[row]: 27.5});
                    }
                    for (let j = 0; j < rows[i].tags.length; j++) {
                        for (let jj = 0; jj < tags.length; jj++) {
                            if (rows[i].tags[j].id === tags[jj].id) {
                                tagsCell(rows.length + sameDayEndCounter[rowDaysL + rowDays], rowDaysL + rowDays, jj);
                                sameDayEndCounter[rowDaysL + rowDays]++;
                            }
                        }
                    }
                }
                document.getElementById("popWindow_loading").style.display = "none";
            }, 100);
        });
    };

    render() {
        return (
            <></>
        )
    };
}

export default LuckysheetRenderData;
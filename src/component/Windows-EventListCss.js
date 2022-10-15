import * as WindowCss from "./WindowCss";
import * as ButtonCss from "./ButtonCss";

export const pressButtonEffect = ButtonCss.pressButtonEffect;

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
export const textColorCss = (color) => {
    return {
        color: textColor(color),
    }
}

export const tableCss = {
    position: "relative",
    top: "10px",
    left: "8px",
    width: window.innerWidth * WindowCss.PopWindowCss_windowWidth - 16,
    height: window.innerHeight * WindowCss.PopWindowCss_windowHeight - 41,
    overflowY: "scroll",
}

export const tableBodyCellCss = {
    paddingBottom: 0,
    paddingTop: 0
}

// columns
const columns = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}
export let col1Css;
export let col2Css;
export let col3Css;
if (window.innerWidth < 420) {
    col1Css = {
        ...{
            width: "100%",
        },
        ...columns,
    }
    col2Css = {
        ...{
            position: "relative",
            top: -12,
            width: 160,
        },
        ...columns,
    }
    col3Css = {
        ...{
            position: "relative",
            top: 12,
            left: -165,
        },
        ...columns,
    }
} else {
    col1Css = {
        ...{
            width: "15%"
        },
        ...columns,
    }
    col2Css = {
        ...{
            width: "25%"
        },
        ...columns,
    }
    col3Css = {
        ...{
            width: "60%"
        },
        ...columns,
    }
}
export const tagCol1Css = {
    ...{
        width: "20%"
    },
    ...columns
}
export const tagCol2Css = {
    ...{
        width: "80%"
    },
    ...columns
}
export const colorTag = (color) => {
    return {
        ...{
            backgroundColor: color,
            color: textColor(color),
            borderRadius: "40px",
        },
        ...columns
    }
}

// sub tables
const subTableCss = {
    position: "relative",
    top: "-9px",
    boxSizing: "border-box",
}
export const subTableLeftCss = (border) => {
    let ifBorder = {}
    if (window.innerWidth >= 1370) {
        if (border) {
            ifBorder = {
                borderRight: "1px solid #ddd",
            }
        }
        return {
            ...{
                float: "left",
                width: `50%`,
            },
            ...ifBorder,
            ...subTableCss
        }
    } else {
        return {
            ...{
                float: "left",
                width: `100%`,
            },
            ...subTableCss
        }
    }
}
export const subTableRightCss = (border) => {
    let ifBorder = {}
    if (window.innerWidth >= 1370) {
        if (border) {
            ifBorder = {
                borderLeft: "1px solid #ddd",
            }
        }
        return {
            ...{
                float: "right",
                width: `50%`,
            },
            ...ifBorder,
            ...subTableCss
        }
    } else {
        return {
            ...{
                float: "left",
                width: `100%`,
            },
            ...subTableCss
        }
    }
}
export const subTableTagRowCss = {
    borderBottom: "1px solid #ddd",
}
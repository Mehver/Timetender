import * as ButtonCss from "./ButtonCss";
import * as WindowCss from "./WindowCss";
export const pressButtonEffect = ButtonCss.pressButtonEffect;

export const settingBodyCss = {
    position: "relative",
    // top: "10px",
    // left: "8px",
    transform: 'translate(0, 20%)',
    width: window.innerWidth * WindowCss.PopWindowCss_windowWidth - 16,
    height: window.innerHeight * WindowCss.PopWindowCss_windowHeight - 41,
    // overflowY: "scroll",
}
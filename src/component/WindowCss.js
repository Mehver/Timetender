import * as ButtonCss from "./ButtonCss";
export const buttonCss = ButtonCss.buttonCss;
export const iconCss = ButtonCss.iconCss;
export const pressButtonEffect = ButtonCss.pressButtonEffect;

let width_button = 33;
if (window.innerWidth < 420) {
    width_button = (window.innerWidth - 200) / 7;
}
let windowWidth = 0.46;
if (window.innerWidth < window.innerHeight) {
    windowWidth = 0.94;
}
let windowHeight = 0.9;
export const popWindow = {
    position: 'absolute',
    width: windowWidth * window.innerWidth,
    height: windowHeight * window.innerHeight,
    backgroundColor: '#abc',
    border: '1px solid #abc',
    borderRadius: '5px',
    overflow: 'hidden',
    display: 'none',
}
export const PopWindowCss_windowWidth = windowWidth;
export const PopWindowCss_windowHeight = windowHeight;
export const listWindow_buttonBarCss = {
    float: 'right',
    position: 'relative',
    top: '5px',
    right: '5px',
}
export const loading_infoCss = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '20px',
    color: '#fff',
    backgroundColor: '#abc',
}
export const loading_iconCss = {
    fontSize: 60,
    color: '#fff',
    float: 'middle',
}
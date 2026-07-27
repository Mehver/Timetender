let width_button = 33;
let iconSize = 16;
if (window.innerWidth < 420) {
    width_button = (window.innerWidth - 200) / 7;
    iconSize = window.innerWidth / 34;
}

export const buttonCss = {
    float: 'left',
    cursor: 'pointer',
    left: 15,
    width: width_button,
    backgroundColor: '#fff',
    border: '2px solid #abc',
    height: '23px',
};

export const iconCss = {
    fontSize: iconSize,
    color: '#abc',
};

export const pressButtonEffect = function (buttonId) {
    let button = document.getElementById(buttonId);
    button.style.backgroundColor = "#abc";
    setTimeout(function () {
        button.style.backgroundColor = "#fff";
    }, 100);
};
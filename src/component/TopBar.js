// export to ./src/App.js

import React from 'react';

class TopBar extends React.Component {

    render() {
        const topBarCss = {
            position: 'absolute',
            top: '-5px',
            width: '100%',
            height: '35px',
            backgroundColor: '#abc',
        };
        const titleCss = {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#fff',
            float: 'left',
            position: 'relative',
            top: '-14px',
            left: '8px'
        };
        return (
            <>
                <div id="topBar" style={topBarCss}>
                    <p style={titleCss}>Timetender&nbsp;v0.1.1</p>
                </div>
            </>
        )
    }
}

export default TopBar;
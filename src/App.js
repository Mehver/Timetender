import React from 'react';
import './App.css';

import Luckysheet from './component/Luckysheet'
import AutoSaveData from './component/AutoSaveData'
import ToolBar from "./component/TopBar";
import TopBarButtons from "./component/TopBarButtons";
import PopWindow from "./component/Window";

class App extends React.Component {

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <Luckysheet/>
                    <AutoSaveData/>
                    <ToolBar/>
                    <TopBarButtons/>
                    <PopWindow/>
                </header>
            </div>
        );
    };
}

export default App;

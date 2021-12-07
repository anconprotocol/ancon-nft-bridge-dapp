import React, {useState,useEffect} from 'react'
import ifesa from '../../assets/img/ifesa-logo.png'
import ancon from '../../assets/img/ancon-logo.png'
import userLogo from '../../assets/img/user-logo.png'
import './style.css';


const Header = () => {

    return (
        <header className="App-header">
            <div className="header-left">
                <img className="ifesa-logo" src={ifesa}></img>
                <img className="ancon-logo" src={ancon}></img>
            </div>
            <div className="header-right">
                <span class="header-right-text">News</span>
                <div class="header-user-container">

                    <div className="user-logo-container">
                        <div className="spinner"></div>
                        <img  src={userLogo}></img>
                    </div>
                   
                    <span class="header-user">Jhon Doe</span>
                </div>
            </div>
        </header>
    )
}

export default Header
import React, {useState,useEffect} from 'react'
import heart from '../../assets/img/heart.png'
import './style.css';


const Footer = () => {

    return (
        <footer className="App-footer">
            <div className="footer-left">
                <span class="footer-left-text">© Industrias de Firmas Electronicas SA, 2021 </span>
                <span class="footer-left-text">Made with <img className="heart-img" src={heart}></img> in Panama </span>
            </div>
            <div className="footer-right">
                <span class="footer-right-text">INQUIRY BUSINESS SOLUTIONS</span>
                <span class="footer-right-text">SUPPORT</span>
            </div>
        </footer>
    )
}

export default Footer
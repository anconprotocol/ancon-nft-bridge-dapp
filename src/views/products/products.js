import React, {useState,useEffect} from 'react'
import { Navigate  } from "react-router-dom";
import newIcon from '../../assets/img/new-icon.png'
import transferIcon from '../../assets/img/transfer-icon.png'
import Transfer from '../transfer/transfer'
import './style.css';


function Products() {
    const [transfer, goTransfer] = useState(false)
    const [create, goCreate] = useState(false)

    return(
        <div className="Products-body">
            {
                transfer == true? <Navigate exact to="/Transfer" /> : null  
            }
            {
                create == true? <Navigate exact to="/Create" /> : null 
            }
            
            <div className="products-container">
                <div className="products-card" onClick= {()=>{goCreate(true)}}>
                    <img className="products-icon" src={newIcon}></img>
                    <span className="products-name">New NFT</span>
                </div>
                <div className="products-card" onClick= {()=>{goTransfer(true)}}>
                    <img className="products-icon" src={transferIcon}></img>
                    <span className="products-name">CrossChain Transfer</span>
                </div>
            </div>
        </div>
    )
}

export default Products;
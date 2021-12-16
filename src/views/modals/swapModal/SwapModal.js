import React, {useState,useEffect} from 'react'
import './style.css';


const SwapModal = ({ handleClose, show, message, step }) => {
    const [loading, setLoading] = useState(true)
    const [localMessage, setMessage] = useState(message)
    const showHideClassName = show==true ? "swap-modal display-block" : "modal display-none";
    const response={
        owner: 'Jhon Doe',
        creationDate: '01/12/2021'
    }


    useEffect(() => {
        console.log("step= ", step)
        const timer = setTimeout(() => {
            if(step == 1 && localMessage=='Requesting NFT info...'){
                setLoading(false)
            }
            if(step == 2 && localMessage=='Loading...'){
                setMessage("Requesting proof signing...")
            }
            if(step == 2 && localMessage=='Requesting proof signing...'){
                setMessage("Swap mint with proof...")
            }
            if(step == 2 && localMessage=='Swap mint with proof...'){
                setLoading(false)
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [localMessage]);

    return (
        <div className={showHideClassName}>
            <section className="swap-modal-main">
                <div className="swap-modal-header">
                    <span>Transaction status</span>
                    {!loading?
                        <div class="swap-modal-btn" onClick={handleClose}><a>Close</a></div>
                    :null}
                </div>
                {loading?
                    <div className="swap-modal-body">
                        <div className="swap-modal-loader">
                        
                        </div>
                        <span class="swap-modal-message">
                            {localMessage}
                        </span>
                    </div>
                    :
                    <div className="swap-modal-body">
                            <span className="swap-modal-text">Success</span>
                    </div>
                } 
            </section>
        </div>
    );
};

export default SwapModal
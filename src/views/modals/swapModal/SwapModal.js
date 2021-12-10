import React, {useState,useEffect} from 'react'
import './style.css';



const SwapModal = ({ handleClose, show, message }) => {
    const [loading, setLoading] = useState(true)
    const [localMessage, setMessage] = useState(message)
    const [step, setStep] = useState(1)
    const showHideClassName = show==true ? "swap-modal display-block" : "modal display-none";
    const response={
        owner: 'Jhon Doe',
        creationDate: '01/12/2021'
    }


    useEffect(() => {
        const timer = setTimeout(() => {
            if(step == 1 && localMessage=='loading...'){
                setMessage("Creating metadata...")
            }
            if(step == 1 && localMessage=='Creating metadata...'){
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
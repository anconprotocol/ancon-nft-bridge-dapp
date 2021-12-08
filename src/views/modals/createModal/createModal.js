import React, {useState,useEffect} from 'react'
import './style.css';



const CreateModal = ({ handleClose, show, step, message }) => {
    const [loading, setLoading] = useState(true)
    const [localMessage, setMessage] = useState(message)
    const showHideClassName = show==true ? "create-modal display-block" : "modal display-none";
    const response={
        owner: 'Jhon Doe',
        creationDate: '01/12/2021'
    }


    useEffect(() => {
        const timer = setTimeout(() => {
            if(step == 1 && localMessage=='Uploading image...'){
                setMessage("Creating metadata...")
            }
            if(step == 1 && localMessage=='Creating metadata...'){
                setLoading(false)
            }
            if(step == 2){
                setLoading(false)
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [localMessage]);
    return (
        <div className={showHideClassName}>
            <section className="create-modal-main">
                <div className="create-modal-header">
                    <span>Transaction status</span>
                    {!loading?
                        <div class="create-modal-btn" onClick={handleClose}><a>Close</a></div>
                    :null}
                </div>
                {loading?
                    <div className="create-modal-body">
                        <div className="create-modal-loader">
                        
                        </div>
                        <span class="create-modal-message">
                            {localMessage}
                        </span>
                    </div>
                    :
                    <div className="create-modal-body">
                            <span className="create-modal-text">Success</span>
                    </div>
                } 
            </section>
        </div>
    );
};

export default CreateModal
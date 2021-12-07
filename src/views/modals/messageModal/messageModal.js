import React, {useState} from 'react'
import './style.css';



const MessageModal = ({ handleClose, show, type }) => {

    const showHideClassName = show==true ? "modal display-block" : "modal display-none";

    return (
        <div className={showHideClassName}>
            <section className="modal-main">
                {type == 'success'?
                    <span className="success">Transasction successfull!.</span>
                    :
                    <span className="error">Transaction failed!.</span>
                }
                <section className="modal-btn">
                    <div class="message-modal-btn" onClick={handleClose}><a>Continue</a></div>
                </section>
            </section>
        </div>
    );
};

export default MessageModal
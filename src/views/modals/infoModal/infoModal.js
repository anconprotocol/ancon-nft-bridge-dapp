import React, {useState,useEffect} from 'react'
import './style.css';



const InfoModal = ({ handleClose, show, cid }) => {
    const [loading, setLoading] = useState(true)

    const showHideClassName = show==true ? "info-modal display-block" : "modal display-none";
    const response={
        owner: 'Jhon Doe',
        creationDate: '01/12/2021'
    }


    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false)
        }, 4000);
        return () => clearTimeout(timer);
    }, []);
    return (
        <div className={showHideClassName}>
            <section className="info-modal-main">
                <div className="info-modal-header">
                    <span>NFT Details</span>
                    <div class="info-modal-btn" onClick={handleClose}><a>Close</a></div>
                </div>
                {loading?
                    <div className="info-modal-body">
                        <div className="info-modal-loader">
                        
                        </div>
                        <span class="info-modal-message">
                            Loading...
                        </span>
                    </div>
                    :
                    <div className="info-modal-body">
                        <span class="modal-label">
                            cid
                        </span>
                        <span class="modal-text">
                            {cid}
                        </span>
                        <span class="modal-label">
                            owner
                        </span>
                        <span class="modal-text">
                            {response.owner}
                        </span>
                        <span class="modal-label">
                            creation date
                        </span>
                        <span class="modal-text">
                            {response.creationDate}
                        </span>
                    </div>
                } 
            </section>
        </div>
    );
};

export default InfoModal
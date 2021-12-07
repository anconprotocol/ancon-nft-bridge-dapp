import React, {useState,useEffect} from 'react'
import MessageModal from '../modals/messageModal/messageModal'
import InfoModal from '../modals/infoModal/infoModal'
import './style.css';


function Transfer() {
    const [openMessageModal, setMessageModal] = useState(false)
    const [openInfoModal, setInfoModal] = useState(false)
    const [inputCid, setNewCid] = useState('')

    return (
        <div className="transfer-body">
            <div className="card">
            <div className="card-title">
                <span>Owner swap</span>
                <div class="check-btn" onClick= {() => setInfoModal(true)}><a>Check CID </a></div>

            </div>
            <div className="card-body">
                <a className="input-label">NFT-CID</a>
                <input 
                type="text" 
                className="card-input"
                onChange={(e)=>{setNewCid(e.target.value)}}> 
                </input>
                <a className="input-label">New Owner</a>
                <input 
                type="text" 
                className="card-input">
                </input>
                <div class="container">
                <div 
                    class="card-btn"
                    onClick= {() => setMessageModal(true)}
                >
                    <a>Send transaction</a>
                </div>
                </div>
                
            </div>

            </div>
            <MessageModal
                show={openMessageModal}
                handleClose={() => setMessageModal(false)}
                type='success'
            >
            </MessageModal>
            {openInfoModal?
                <InfoModal
                show={openInfoModal}
                handleClose={() => setInfoModal(false)}
                cid={inputCid}
                >
                </InfoModal>
                :null
            }
        </div>
    )
}

export default Transfer;
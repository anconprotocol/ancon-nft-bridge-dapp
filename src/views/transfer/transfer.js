import React, { useState, useEffect } from 'react'
import MessageModal from '../modals/messageModal/messageModal'
import InfoModal from '../modals/infoModal/infoModal'
import './style.css';
import SwapModal from '../modals/swapModal/SwapModal';


function Transfer() {
    const [openMessageModal, setMessageModal] = useState(false)
    const [openInfoModal, setInfoModal] = useState(false)
    const [inputCid, setNewCid] = useState('')

    return (
        <div className="transfer-body">
            <div className="card">
                <div className="card-title">
                    <span>CrossChain Transfer</span>
                    {/* <div class="check-btn" onClick={() => setInfoModal(true)}><a>Check CID </a></div> */}

                </div>
                <div className="card-body">
                    <div className="info-modal-body">
                        <span class="input-label">
                            CID
                        </span>
                        <span class="info-text">
                            {"QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5M"}
                        </span>
                        <span class="input-label">
                            OWNER
                        </span>
                        <span class="info-text">
                        {"z8mWaJHXieAVxxLagBpdaNWFEBKVWmMiE"}
                        </span>
                    </div>
                    <a className="input-label">TO OWNER</a>
                    <input
                        type="text"
                        className="card-input"
                        onChange={(e) => { setNewCid(e.target.value) }}>
                    </input>
                    <a className="input-label">TO ADDRESS</a>
                    <input
                        type="text"
                        className="card-input">
                    </input>
                    
                    <div class="container">
                        <div
                            class="card-btn"
                            onClick={() => setMessageModal(true)}
                        >
                            <a>Send transaction</a>
                        </div>
                    </div>

                </div>

            </div>
            <SwapModal
                show={openMessageModal}
                handleClose={() => setMessageModal(false)}
                message='loading...'
            >
            </SwapModal>
            {/* {openInfoModal ?
                <SwapModal
                    show={openInfoModal}
                    handleClose={() => setInfoModal(false)}
                >
                </SwapModal>
                : null
            } */}
        </div>
    )
}

export default Transfer;
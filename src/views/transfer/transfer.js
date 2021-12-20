import React, { useState, useEffect } from 'react'
import MessageModal from '../modals/messageModal/messageModal'
import InfoModal from '../modals/infoModal/infoModal'
import './style.css';
import SwapModal from '../modals/swapModal/SwapModal';
import testImg from '../../assets/img/ancon-logo.png';


function Transfer() {
    const [openMessageModal, setMessageModal] = useState(false)
    const [openFetchModal, setFetchModal] = useState(false)
    const [inputCid, setNewCid] = useState('')
    const [modalMessage, setMessage] = useState('')
    const [localStep, setStep] = useState(1)
    const [fireFoxClass, isFireFox] = useState('')


    const fetchNft = () => {
        setMessage('Requesting NFT info...')
        setFetchModal(true)
    }

    const send = () => {
        setMessage('Loading...')
        setMessageModal(true)
    }

    const back = () => {
        window.scrollTo(0, 0)
        var tempStep = localStep
        setStep(tempStep-1)
    }

    const nextStep = () => {
        var tempStep = localStep
        setStep(tempStep+1)
        setFetchModal(false)
    }

    
    useEffect(() => {
        var firefox = typeof InstallTrigger !== 'undefined';
        if(firefox == true){
            isFireFox('-moz')
        }
    }, [])
    return (
        <div className="transfer-body">
            {localStep==1?
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
                            <input
                                type="text"
                                className="card-input">
                            </input>
                            <div class="container">
                                <div
                                    class={`card-btn${fireFoxClass}`}
                                    onClick={() => fetchNft()}
                                >
                                    <a>Check NFT</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                :
                <div className="swap-card">
                    <div className="card-title">
                        <span>CrossChain Transfer</span>
                    </div>
                    <div className="swap-card-body">

                        <div className="swap-card-body-info">
                            <div className="info-left">
                                <div className="info-img">
                                    <img
                                        className="nft-img"
                                        src={testImg}
                                        style={{ maxWidth: "120px" }}
                                    />
                                </div>
                            </div>
                            <div className="info-right">
                                <div className="info-element">
                                    <span class="input-label">
                                        CID
                                    </span>
                                    <span class="swap-info-text">
                                        {"QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5M"}
                                    </span>
                                </div>
                                <div className="info-element">
                                    <span class="input-label">
                                        OWNER
                                    </span>
                                    <span class="swap-info-text">
                                        {"z8mWaJHXieAVxxLagBpdaNWFEBKVWmMiE"}
                                    </span>
                                </div>
                                <div className="info-element">
                                    <span class="input-label">
                                        NFT Name
                                    </span>
                                    <span class="swap-info-text">
                                        {"Test name"}
                                    </span>
                                </div>
                                <div className="info-element">
                                    <span class="input-label">
                                        Description
                                    </span>
                                    <span class="swap-info-text">
                                        {"Test description"}
                                    </span>
                                </div>
                            </div>
                            
                        </div>
                        <div>
                            <span class="inputs-title">
                                Destination data
                            </span>
                        </div>
                        <div className="swap-card-body-inputs">
                            
                            <div className="inputs-element">
                                <a className="input-label">TO OWNER</a>
                                <input
                                    type="text"
                                    className="card-input"
                                    onChange={(e) => { setNewCid(e.target.value) }}>
                                </input>
                            </div>
                            <div className="inputs-element">
                                <a className="input-label">TO ADDRESS</a>
                                <input
                                    type="text"
                                    className="card-input">
                                </input>
                            </div>
                        </div>
                        <div className="swap-card-body-buttons">
                            <div class="container">
                                <div
                                    class={`back-btn${fireFoxClass}`}
                                    onClick={() => back()}
                                >
                                    <a>{"< Back"}</a>
                                </div>
                            </div>
                            <div class="container">
                                <div
                                    class={`card-btn${fireFoxClass}`}
                                    onClick={() => send()}
                                >
                                    <a>Send transaction</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {openFetchModal ?
                <SwapModal
                    show={openFetchModal}
                    step={localStep}
                    handleClose={() => nextStep()}
                    message={modalMessage}
                >
                </SwapModal>
                :null
            }
            {openMessageModal ?
                <SwapModal
                    show={openMessageModal}
                    step={localStep}
                    handleClose={() => setMessageModal(false)}
                    message={modalMessage}
                >
                </SwapModal>
                :null
            }  
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
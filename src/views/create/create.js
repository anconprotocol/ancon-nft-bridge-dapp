import React, {useState,useEffect} from 'react'
import MessageModal from '../modals/messageModal/messageModal'
import './style.css';

function Create() {
    const [openMessageModal, setMessageModal] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [owner, setOwner] = useState('')
    const [image, setImage] = useState('')


    const clickInput = () => {
        document.getElementById('nft-img').click()
    }


    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target.result.split(',')[1]);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    useEffect(() => {
        console.log("testing img: ", image)
    }, [image])
    
    return (
        <div className="create-body">
            <div className="create-card">
                <div className="create-card-title">
                    <span>Create NFT</span>
                </div>
                <div className="create-card-body">
                    <a className="input-label">NFT Name</a>
                    <input 
                        type="text" 
                        className="create-card-input"
                        onChange={(e)=>{setName(e.target.value)}}> 
                    </input>

                    <a className="input-label">Description</a>
                    <input 
                        type="text" 
                        className="create-card-input"
                        onChange={(e)=>{setDescription(e.target.value)}}> 
                    </input>

                    <a className="input-label">Owner Name</a>
                    <input 
                        type="text" 
                        className="create-card-input"
                        onChange={(e)=>{setOwner(e.target.value)}}> 
                    </input>

                    <a className="input-label">Image</a>
                    <a className="input-file" onClick={clickInput}>Upload Image</a>

                    
                    <input 
                        type="file"
                        onChange={onImageChange}
                        className="filetype"
                        id="nft-img"
                        style={{ display: 'none' }}>
                    </input>

                    <div class="create-container">
                    <div 
                        class="create-card-btn"
                        onClick= {() => setMessageModal(true)}
                    >
                        <a>Create</a>
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
        </div>
    )
}

export default Create;
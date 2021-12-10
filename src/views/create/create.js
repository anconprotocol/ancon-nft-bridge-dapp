import React, {useState,useEffect} from 'react'
import { Navigate  } from "react-router-dom";
import Web3 from 'web3'
import MessageModal from '../modals/messageModal/messageModal'
import CreateModal from '../modals/createModal/createModal'
import './style.css';

function Create() {
    const [home, goHome] = useState(false)
    const [openMessageModal, setMessageModal] = useState(false)
    const [openCreateModal, setCreateModal] = useState(false)
    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [owner, setOwner] = useState('')
    const [image, setImage] = useState(null)
    const [localImage, setLocalImage] = useState(null)
    const [wallet, setWallet] = useState();

    const clickInput = () => {
        document.getElementById('nft-img').click()
    }


    const onImageChange = (event) => {
        setImage(event.target.files[0])
         if (event.target.files && event.target.files[0]) {
            let reader = new FileReader();
            
            reader.onload = (e) => {
                
                setLocalImage(e.target.result.split(',')[1]);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    const nextStep = () => {
        setStep(2)
        setCreateModal(false)
    }

    const returnToHome = () => {
        setMessageModal(false)
        goHome(true)
    }

/*     const handleClickOpen = () => {
        const state = onboard.getState();
        const _web3 = new Web3(state.wallet.provider);
        _web3.eth.defaultAccount = wallet.address;
        //setWeb3(_web3);
        web3 = _web3;

        bindContracts(web3);
    };

    async function bindContracts(web3) {
        console.log("Beginning of BINDCONTRACTS()");
        ethersInstance = new ethers.providers.Web3Provider(
          web3.currentProvider
        );
        const anconNFTContractAddress = env.AnconTestNFTAddress;
        const AnconTokenContractAddress = env.AnconTokenAddress;
        // const marketplateContractAddress = env.MarketplaceAddress;
    
        nftContract = new web3.eth.Contract(AnconNFT.abi, anconNFTContractAddress);
        anconTokenContract = new web3.eth.Contract(
          AnconToken.abi,
          AnconTokenContractAddress
        );
        ethersContract = new ethers.Contract(
          anconNFTContractAddress,
          AnconNFT.abi,
          ethersInstance.getSigner(0)
        );
        console.log("End of BINDCONTRACTS()", nftContract.defaultAccount);
      }
    
      async function createDocumentNode(file, web3) {
        setLoading(true)
        console.log("Beginning of CREATEDOCUMENTNODE()");
        console.log("Local Account Address", nftContract.defaultAccount);
        try {
          videoFile = file[0];
          const ipfs = new IPFSManager();
          await ipfs.start();
    
          setMintingStatus('Uploading...');
          // indexes = await ipfs.addVideoObject(videoFile, values);
    
          console.log("files", videoFile);
          transactionStatus = "Creating transaction on the blockchain...";
          const bob = nftContract.defaultAccount;
          
          setMintingStatus('Sign the transaction to mint your NFTs...');
          await anconTokenContract.methods
            .approve(nftContract._address, "1000000000000000000")
            .send({
              gasPrice: "22000000000",
              gas: 400000,
              from: nftContract.defaultAccount,
            });
    
          setMintingStatus('Minting...');
          const txmint = await nftContract.methods
            .mint(
              bob, //user address
              "1", //token uri
              // wallet.address, // send wallet address instead of did
              // web3.utils.fromUtf8(indexes),
              // false, // encrypted
              // values.title,
              // "address"
            )
            .send({
              gasPrice: "22000000000",
              gas: 4000000,
              from: wallet.address,
            });
    
          setMintingStatus('Wrapping up...');
          //await txmint.wait(1);
          const response = await nftContract.getPastEvents("DocumentAnchored", {
            toBlock: "latest",
            fromBlock: 0,
            filter: { user: localAddress },
          });
    
          const blockItem = response.reverse()[0];
          const root = await ipfs.getObject(
            web3.utils.hexToUtf8(blockItem.returnValues.documentURI)
          );
          console.log("url", root);
          console.log('TXMINT', txmint);
          console.log('Blockitem' + blockItem);
          // this.showTransactionCancelBtn = true;
          transactionAddress = txmint.transactionHash;
          //ipfsId = indexes;
          transactionStatus = "";
          let urlVideo = "https://ipfs.io/ipfs/" + root.videoUrl;
          setIPFSLink(urlVideo);
          setTransactionHash(transactionAddress);
          setTransactionHashLink("https://testnet.bscscan.com/tx/" + transactionAddress);
          
          setStep(true)
        
          //await this.fetchDocuments();
          // this.instanceVideoPlayer(
          //     "https://ipfs.io/ipfs/" + root.value.metadata.videourl.toString()
          // );
        } catch (e) {
          // setStep(true)
          transactionStatus = "An error has occurred";
          console.log("confirmation error", e);
        }
    } */
    
    async function setOnchainMetadata() {
        const payload = {
            "name": "XDV metadata sample",
            "description": "testing sample",
            "image": "https://explore.ipld.io/#/explore/QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D",
            "sources": [
              "QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D",
              "z8mWaJHXieAVxxLagBpdaNWFEBKVWmMiE",
              "QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm",
            ],
        };

    }
    
    return (
        <div className="create-body">
            {
                home == true? <Navigate exact to="/" /> : null  
            }
            <div className="create-card">
                <div className="create-card-title">
                    <span>Create NFT</span>
                </div>
                {step==1?
                    <div className="create-card-body">
                        <div className="file-container">
                            <a className="input-file" onClick={clickInput}>Select Image</a>
                        </div>
                        
                        {localImage!=null?
                            <img
                                className="nft-img"
                                src={`data:image/jpeg;base64,${localImage}`}
                                style={{ maxWidth: "120px" }}
                            />
                        :null}
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
                                onClick= {() => setCreateModal(true)}
                            >
                                <a>Upload image</a>
                            </div>
                        </div>
                    </div>
                :null
                }
                {step==2?
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

                        <img
                            className="nft-img"
                            src={`data:image/jpeg;base64,${localImage}`}
                            style={{ maxWidth: "120px" }}
                        />

                        <div class="create-container">
                            <div 
                                class="create-card-btn"
                                onClick= {() => setMessageModal(true)}
                            >
                                <a>Create</a>
                            </div>
                        </div>
                        
                    </div>
                    :null
                }
                
            </div>
            {openMessageModal?
                <CreateModal
                    show={openMessageModal}
                    handleClose={() => returnToHome()}
                    message='Minting NFT...'
                    step={step}
                >
                </CreateModal>
                :null
            }
            {openCreateModal?
                <CreateModal
                    show={openCreateModal}
                    handleClose={() => nextStep()}
                    message='Uploading image...'
                    step={step}
                >
                </CreateModal>
                :null
            }
        </div>
    )
}

export default Create;
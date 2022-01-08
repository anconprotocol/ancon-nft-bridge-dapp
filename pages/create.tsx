import { useRouter } from "next/router";
import React from "react";
import { useState, useEffect } from "react";
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";

// components
import Header from "../components/Header";
import ErrorMessage from "../components/ErrorMessage";

// web3
import { Web3Storage } from "web3.storage";
import { ethers } from "ethers";
import useProvider from "../hooks/useProvider";
import { addressState } from "../atoms/addressAtom";
import { errorState } from "../atoms/errorAtom";
import { base64, keccak256 } from "ethers/lib/utils";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";

// functions
import enrollL2Account from "../functions/EnrollL2Account";
import toAbiProof from "../functions/ToAbiProof";
import getTransaction from "../functions/GetTransaction";
import GetPublicKey from "../functions/GetPublicKey";
import {
  AnconVerifier__factory,
  XDVNFT__factory,
} from "../types/ethers-contracts";
import Web3 from "web3";
import { DidState } from "../atoms/DIDAtom";
import { FetchEvent } from "next/dist/server/web/spec-compliant/fetch-event";

//Contracts
const AnconToken = require("../contracts/ANCON.sol/ANCON.json");
const AnconNFT = require("../contracts/AnconNFT.sol/AnconNFT.json");

// fix the type error for document in nextjs
declare let document: any;
function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function Create() {
  // state
  const [step, setStep] = useState(0);
  const [localImage, setLocalImage] = useState<any | null>(null);
  const [image, setImage] = useState<any | null>(null);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [tokenData, setTokenData] = useState({
    name: "",
    description: "",
    imageCid: "",
    tokenCid: "",
    proofKey: "",
  });
  const [transactionHash, setTransactionHash] = useState({
    transaction: "",
    name: "",
  });
  const [packet, setPacket] = useState({ proof: "", packet: "" });
  const [user, setUser] = useState({ key: "", height: "" });
  // atoms
  const [address, setAddress] = useRecoilState(addressState);
  const setErrorModal = useSetRecoilState(errorState);
  // const DIDcid = useRecoilValue(DidState)
  // hooks
  const router = useRouter();
  const provider: any = useProvider();
  const clickInput = () => document.getElementById("nft-img").click();

  //step 0 //

  // STEP 0  gets the public key and handle the get did//
  //get the public key
  const getDid = async () => {
    // check if the a name written
    if (transactionHash.name === "") {
      setError(true);
      return;
    } else {
      setStep(-1);
      setMessage("Verifying L2 name...");
    }
    try {
      const domain = await getDomainName();
      if (domain === false) {
        setErrorModal([
          "This Domain does not match the records please try again or procced to create a NFT",
          "Try again",
          "/create",
          "Enroll Account",
          "/enroll",
        ]);
      } else {
        setStep(1);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const getDomainName = async () => {
    const rawResponse = await fetch(
      `https://api.ancon.did.pa/user/${transactionHash.name}/did.json`
    );
    const response = await rawResponse.json();
    console.log("response", rawResponse);
    if (rawResponse.status === 400) {
      return false;
    }
    return true;
  };

  // step 1 //
  // checks if the user has selected the image, if so the it continue
  const handleUpdloadImage = () => {
    if (image === null) {
      setError(true);
    } else {
      setStep(2);
      handleUpload();
      setError(false);
    }
  };

  // step 2 //
  // loading screen

  // step3 //
  // retrieve the ipfs access token
  const getAccessToken = () => {
    const apikey: any = process.env.NEXT_PUBLIC_API_KEY_STORAGE;
    return apikey;
  };
  // uploads the file to the ipfs
  const handleUpload = async () => {
    try {
      // make the client
      const storage = new Web3Storage({
        token: getAccessToken(),
      });
      // show the root cid as soon as it's ready
      const onRootCidReady = (cid: string) => {
        console.log("uploading files with cid:", cid);
      };

      // when each chunk is stored, update the percentage complete and display
      const totalSize = image.size;
      let uploaded = 0;

      const onStoredChunk = (size: number) => {
        uploaded += size;
        const pct = totalSize / uploaded;
        console.log(`Uploading... ${pct.toFixed(2)}% complete`);
      };

      const imageCid: string = await storage.put([image], {
        onRootCidReady,
        onStoredChunk,
      });
      setTokenData({ ...tokenData, imageCid });
      setStep(3);
    } catch (error) {
      console.log("err", error);
    }
  };

  // step4 //
  // creates the metadata
  const createMetadata = async () => {
    const prov = new ethers.providers.Web3Provider(provider);
    const signer = prov.getSigner();
    const payload = {
      name: tokenData.name,
      description: tokenData.description,
      image: tokenData.imageCid,
      sources: [],
    };
    // sign the message
    const signature = await signer.signMessage(
      ethers.utils.arrayify(
        ethers.utils.toUtf8Bytes(JSON.stringify(payload))
      )
    );
    const DIDcid = localStorage.getItem("DIDCid");
    console.log("did", DIDcid);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/",
        from: DIDcid,
        signature,
        data: payload,
        pin: "true",
      }),
    };
    try {
      // creates the metadata
      const PostRequest = async () => {
        const rawMetadata = await fetch(
          "https://api.ancon.did.pa/v0/dagjson",
          requestOptions
        );
        const metadata = await rawMetadata.json();
        // returns the metadata cid
        console.log("metadata", metadata);
        let id: any;
        if (metadata !== null) {
          id = await Object?.values(metadata.cid)[0];
        }

        setTokenData({ ...tokenData, tokenCid: id });
        console.log("didCID", DIDcid);
        const dagRequest = await fetch(
          `https://api.ancon.did.pa/v0/dagjson/${id}/`
        );
        const dag = await dagRequest.json();
        let metadataCid: any;
        let proofKey: any;
        console.log("dag", dag);
        if (dag !== null) {
          metadataCid = await Object?.values(dag.content)[0];
          setTokenData({
            ...tokenData,
            tokenCid: metadataCid,
          });
        }
        let hexdata = ethers.utils.defaultAbiCoder.encode(
          ["address", "string"],
          [address, metadataCid]
        );
        // let hexdata = Web3.utils.stringToHex(metadataCid)

        let s = await signer.signMessage(
          ethers.utils.arrayify(
            ethers.utils.toUtf8Bytes(JSON.stringify([hexdata]))
          )
        );
        // let s = await signer.signMessage(hexdata)

        console.log("dag", dag, metadataCid);
        console.log("61 seconds");
        setMessage("Creating Offchain Metadata...");
        setStep(-1);
        await sleep(61000);

        const rawPostProof = await fetch(
          "https://api.ancon.did.pa/v0/dagjson",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "/",
              from: DIDcid,
              signature: s,
              data: [hexdata],
            }),
          }
        );
        const postProof = await rawPostProof.json();
        const key = await Object?.values(postProof.cid)[0];
        console.log("date", postProof, key);

        const rawGetProof = await fetch(
          `https://api.ancon.did.pa/v0/dagjson/${key}/`
        );
        const getProof = await rawGetProof.json();
        let packetId: any = await Object?.values(getProof.content)[0];
        setUser({ key: getProof.key, height: getProof.height });
        const rawPacket = await fetch(
          `https://api.ancon.did.pa/v0/dagjson/${packetId}/`
        );
        const packet = await rawPacket.json();

        // packetId = await packet[0][0];
        // console.log('packetid', packetId, packet)
        // packetId = ethers.utils.base64.decode(packetId.bytes);
        // console.log("packet", packet, packetId);
        setPacket({ proof: getProof.proof, packet: hexdata });
        console.log("31 seconds");
        await sleep(61000);
        console.log("fetch", getProof, getProof.proof);
        setMessage("Minting NFT...");
        setStep(4);
      };
      PostRequest();
    } catch (error) {
      console.log("err", error);
    }
  };

  // step 5 //
  let web3;
  let ethersInstance;
  let nftContract: any;
  let anconTokenContract: any;
  let ethersContract;
  let transactionAddress;
  let signer;
  const mintNft = async () => {
    // setStep(5);
    const _web3 = new Web3(provider);
    _web3.eth.defaultAccount = address;
    //setWeb3(_web3);
    web3 = _web3;
    bindContracts(web3);
  };

  async function bindContracts(web3: any) {
    console.log("Beginning of BINDCONTRACTS()");
    ethersInstance = new ethers.providers.Web3Provider(provider);
    signer = ethersInstance.getSigner();

    const contract1 = XDVNFT__factory.connect(
      "0x8f5198c0C4FC8c425528237f7B1adF7480Fd681e",
      ethersInstance
    );
    const contract2 = XDVNFT__factory.connect(
      "0x8f5198c0C4FC8c425528237f7B1adF7480Fd681e",
      signer
    );
    const contract3 = AnconProtocol__factory.connect(
      "0x2B873b2897B84F72537D948f36FE312ce92A37dA",
      ethersInstance
    );
    const contract4 = AnconProtocol__factory.connect(
      "0x2B873b2897B84F72537D948f36FE312ce92A37dA",
      signer
    );

    const dai = new web3.eth.Contract(
      AnconToken.abi,
      "0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867"
    );

    // const allowance = await dai.methods
    //   .allowance(address, contract2.address)
    //   .call();
    // if (allowance == 0) {
    await dai.methods
      .approve(contract2.address, "1000000000000000000")
      .send({
        gasPrice: "22000000000",
        gas: 400000,
        from: address,
      });
    await dai.methods
      .approve(contract3.address, "1000000000000000000")
      .send({
        gasPrice: "22000000000",
        gas: 400000,
        from: address,
      });
    // }
    await sleep(7000);

    // checking hashes
    const rawLastHash = await fetch(
      "https://api.ancon.did.pa/v0/proofs/lasthash"
    );
    const lasthash = await rawLastHash.json();
    const relayHash = await contract3.getProtocolHeader();
    console.log(
      "last hash",
      ethers.utils.hexlify(
        ethers.utils.base64.decode(lasthash.lastHash.hash)
      )
    );
    console.log("relay hash", relayHash);

    // get the key and height
    const key = localStorage.getItem("proofKey");
    const height = localStorage.getItem("proofHeight");

    // prepare packet proof
    const rawPacketProof = await fetch(
      `https://api.ancon.did.pa/v0/proof/${user.key}?height=${user.height}`
    );
    let packetProof = await rawPacketProof.json();
    packetProof = toAbiProof({ ...packetProof[0].Proof.exist });

    // prepare user proof
    const rawUserProof = await fetch(
      `https://api.ancon.did.pa/v0/proof/${key}?height=${user.height}`
    );
    let userProof = await rawUserProof.json();
    userProof = toAbiProof({ ...userProof[0].Proof.exist });

    // let userProof: any = localStorage.getItem("ProofCid");
    // const rawproof = await fetch(
    //   `https://api.ancon.did.pa/v0/dagjson/${userProof}/`
    // );

    // userProof = await rawproof.json();

    // userProof = toAbiProof(userProof.proof.proofs[0].Proof.exist);
    // fetch with proof key
    const hexData = packet.packet;

    const hash = ethers.utils.solidityKeccak256(
      ["address", "string"],
      [address, tokenData.tokenCid]
    );
    console.log("hash", hash, "packet", hexData);
    let mint;
    console.log(
      packetProof.key,
      packet.packet,
      userProof,
      packetProof,
      hash
    );
    mint = await contract2.mintWithProof(
      packetProof.key,
      hexData,
      userProof,
      packetProof,
      hash
    );
    // mint = await contract4.submitPacketWithProof(
    //   address,
    //   userProof,
    //   packetProof.key,
    //   packet.packet,
    //   packetProof
    // );
    console.log(
      "userProof",
      base64.decode(userProof.value),
      "packetProof",
      base64.decode(packetProof.value)
    );
    let mint2;
    try {
      mint2 = await contract4.verifyProofWithKV(
        packetProof.key,
        packetProof.value,
        packetProof
      );
    } catch (error) {
      console.log("error", error);
    }
    // try {
    //   mint = await contract4.verifyProofWithKV(
    //     userProof.key,
    //     userProof.value,
    //     userProof
    //   );
    // } catch (error) {
    //   console.log("error", error);
    // }

    console.log("user", mint);
    console.log("packet", mint2);

    // createDocumentNode(web3);
  }

  async function createDocumentNode(web3: any) {
    console.log("Beginning of CREATEDOCUMENTNODE()");
    console.log("Local Account Address", nftContract.defaultAccount);
    const encoding = ethers.utils.defaultAbiCoder.encode(
      ["address", "string"],
      [address]
    );
    try {
      const bob = nftContract.defaultAccount;

      setMessage("Sign the transaction to mint your NFTs...");
      await anconTokenContract.methods
        .approve(nftContract._address, "1000000000000000000")
        .send({
          gasPrice: "22000000000",
          gas: 400000,
          from: nftContract.defaultAccount,
        });

      const txmint = await nftContract.methods
        .mint(
          bob, //user address
          tokenData.imageCid //token uri/cid
          // wallet.address, // send wallet address instead of did
          // web3.utils.fromUtf8(indexes),
          // false, // encrypted
          // values.title,
          // "address"
        )
        .send({
          gasPrice: "22000000000",
          gas: 4000000,
          from: address,
        });

      setMessage("Wrapping up...");
      //await txmint.wait(1);
      // const response = await nftContract.getPastEvents("Transfer", {
      //   toBlock: "latest",
      //   fromBlock: // latest blocknumber
      //   filter: { user: address },
      // });
      // console.log('address', address)
      // console.log('response', response?.reverse()[0])
      // console.log('response', response?.[0])
      // console.log('response', response)
      // const blockItem = response.reverse()[0];
      // const root = await ipfs.getObject(
      //   web3.utils.hexToUtf8(blockItem.returnValues.documentURI)
      // );
      // console.log("url", root);
      console.log("TXMINT", txmint);
      // console.log("Blockitem", blockItem);
      // this.showTransactionCancelBtn = true;
      transactionAddress = txmint.transactionHash;
      //ipfsId = indexes;
      // let urlVideo = "https://ipfs.io/ipfs/" + root.videoUrl;
      // setIPFSLink(urlVideo);
      setTransactionHash({
        transaction: transactionAddress,
        name: "https://testnet.bscscan.com/tx/" + transactionAddress,
      });
      //await this.fetchDocuments();
      // this.instanceVideoPlayer(
      //     "https://ipfs.io/ipfs/" + root.value.metadata.videourl.toString()
      // );
    } catch (e) {
      // setStep(true)
      console.log("confirmation error", e);
    }
  }
  //
  // handles the change of the image
  const onImageChange = (
    event: React.ChangeEvent<HTMLInputElement> | any
  ) => {
    setImage(event.target.files[0]);
    setError(false);
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();

      reader.onload = (e: any) =>
        setLocalImage(e?.target?.result?.split(",")[1]);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  // checks if the user has written a name, if so the it continue
  const handleSetMessageUpload = () => {
    if (tokenData.name === null) {
      setError(true);
    } else {
      createMetadata();
      setError(false);
    }
  };

  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4">
          <span className="text-black font-bold text-xl">
            {step === 4 ? "NFT Created" : "Create NFT"}
          </span>
          {step == 0 ? (
            <div className="mt-4 flex flex-col items-center select-none">
              <p className="font-medium">
                Enter L2 Decentralized Identity
              </p>

              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-sm font-bold mt-4">
                  Name
                </a>
                <input
                  type="text"
                  className="bg-gray-100 rounded-sm h-10 pl-2"
                  onChange={(e) => {
                    setTransactionHash({
                      ...transactionHash,
                      name: e.target.value,
                    });
                  }}
                  value={transactionHash.name}
                ></input>
                <ErrorMessage
                  message="Please provide a Domain Name"
                  show={error}
                />
              </div>
              <div
                onClick={getDid}
                className="mt-4 bg-purple-700 border-2 border-purple-700 rounded-lg px-4 py-2 text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer"
              >
                <p>Continue</p>
              </div>
            </div>
          ) : null}
          {step === -1 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">
                {message != "" ? message : "getting proof..."}
              </p>
            </div>
          ) : null}
          {step == 1 ? (
            <div className="mt-4 flex flex-col items-center">
              <div className="p-3 rounded-lg border-2 bg-gray-50 shadow-sm cursor-pointer hover:tracking-wider transition-all duration-200 hover:border-primary-500 hover:drop-shadow-lg hover:shadow-primary-500 ease-out">
                <p className="" onClick={clickInput}>
                  Select Image
                </p>
              </div>
              <ErrorMessage
                message="Please select an image"
                show={error}
              />

              {localImage != null ? (
                <img
                  className="border-2 p-2 rounded-lg border-primary-500 drop-shadow-xl shadow-primary-500 mt-4"
                  src={`data:image/jpeg;base64,${localImage}`}
                  style={{ maxWidth: "100px" }}
                  alt="local"
                />
              ) : null}
              <input
                type="file"
                onChange={onImageChange}
                className="filetype"
                id="nft-img"
                style={{ display: "none" }}
              ></input>
              <div
                onClick={handleUpdloadImage}
                className="mt-4 bg-purple-700 border-2 border-purple-700 rounded-lg px-4 py-2 text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer"
              >
                <p>Upload image</p>
              </div>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">
                Uploading Image to IPFS
              </p>
            </div>
          ) : null}
          {step == 3 ? (
            <div className="flex-col flex mt-3">
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-sm font-bold">
                  NFT Name
                </a>
                <input
                  type="text"
                  className="bg-gray-100 rounded-sm h-10 pl-2"
                  onChange={(e) => {
                    setTokenData({
                      ...tokenData,
                      name: e.target.value,
                    });
                  }}
                ></input>
              </div>

              <ErrorMessage
                message="Please provide a Name"
                show={error}
              />
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-sm font-bold">
                  Description
                </a>
                <input
                  id="TITLE"
                  className="bg-gray-100 rounded-sm h-10 pl-2"
                  onChange={(e) => {
                    setTokenData({
                      ...tokenData,
                      description: e.target.value,
                    });
                  }}
                ></input>
              </div>
              <div className="flex items-center justify-center mt-3">
                <div>
                  <img
                    className="border-2 p-2 rounded-lg border-primary-500 drop-shadow-xl shadow-primary-500 mt-2"
                    src={`data:image/jpeg;base64,${localImage}`}
                    style={{ maxWidth: "100px" }}
                    alt="finalLocal"
                  />

                  <p
                    onClick={handleSetMessageUpload}
                    className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
                  >
                    Create
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {step === 5 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">{message}</p>
            </div>
          ) : null}
          {step == 4 ? (
            <div className="">
              <div className="flex flex-col items-start mt-3">
                <a className="text-gray-600 text-sm">NFT Name</a>
                <span className="text-lg font-medium mb-2">
                  {tokenData.name}
                </span>

                <a className="text-gray-600 text-sm">Description</a>
                <span className="text-lg font-medium mb-2">
                  {tokenData.description}
                </span>

                <a className="text-gray-600 text-sm">Image CID</a>
                <span className="text-lg font-medium mb-2">
                  {tokenData.imageCid}
                </span>

                <a className="text-gray-600 text-sm">Metada CID</a>
                <span className="text-lg font-medium mb-2">
                  {tokenData.tokenCid}
                </span>

                {/* <a className="text-gray-600 text-sm">OWNER</a>
                <span className="text-lg font-medium mb-2">
                  {address}
                </span> */}

                <div className="flex items-center justify-center mt-3 w-full">
                  <div>
                    <img
                      className="nft-img"
                      src={`data:image/jpeg;base64,${localImage}`}
                      style={{ maxWidth: "120px" }}
                      alt="readyLocal"
                    />
                    <p
                      onClick={mintNft}
                      className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
                    >
                      Mint
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {step == 6 ? (
            <div className="">
              <div className="flex flex-col items-start mt-3">
                <a className="text-gray-600 text-sm">NFT Name</a>
                <span className="text-lg font-medium mb-2">
                  {tokenData.name}
                </span>

                <a className="text-gray-600 text-sm">Description</a>
                <span className="text-lg font-medium mb-2">
                  {tokenData.description}
                </span>

                <a className="text-gray-600 text-sm">Image CID</a>
                <span className="text-lg font-medium mb-2">
                  {tokenData.imageCid}
                </span>

                <a className="text-gray-600 text-sm">Metada CID</a>
                <span className="text-lg font-medium mb-2">
                  {tokenData.tokenCid}
                </span>

                {/* <a className="text-gray-600 text-sm">OWNER</a>
                <span className="text-lg font-medium mb-2">
                  {address}
                </span> */}

                <div className="flex items-center justify-center mt-3 w-full">
                  <div>
                    <img
                      className="nft-img"
                      src={`data:image/jpeg;base64,${localImage}`}
                      style={{ maxWidth: "120px" }}
                      alt="readyLocal"
                    />
                    <p
                      onClick={() => setStep(5)}
                      className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
                    >
                      Close
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default Create;

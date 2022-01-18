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
import toAbiProof from "../functions/ToAbiProof";
// web3
import {
  AnconVerifier__factory,
  XDVNFT__factory,
} from "../types/ethers-contracts";
import Web3 from "web3";
import GetDid from "../functions/GetDid";
import GetChain from "../functions/GetChain";

//Contracts
const AnconToken = require("../contracts/ANCON.sol/ANCON.json");


// fix the type error for document in nextjs
declare let document: any;
export function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function Create() {
  // state
  const [step, setStep] = useState(3);
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
    const NoHexAddress = address.substring(2);
    const rawResponse = await fetch(
      `https://api.ancon.did.pa/user/${NoHexAddress}/did.json`
    );
    const response = await rawResponse.json();
    console.log("response", rawResponse);
    if (rawResponse.status === 400) {
      return false;
    }
    return true;
  };

  // step 1 //

  const getPastEvents = async () => {
    const prov = new ethers.providers.Web3Provider(provider);
    const network = await prov.getNetwork()
    const chain = await GetChain(network);
    const contract1 = AnconProtocol__factory.connect(
      chain.ancon,
      prov
    );
    const filter = contract1.filters.HeaderUpdated();
    const from = await prov.getBlockNumber();
    let result = await contract1.queryFilter(filter, from);
    let time = Date.now();
    const maxTime = Date.now() + 120000;
    while (time < maxTime) {
      result = await contract1.queryFilter(filter, from);
      console.log(result);
      if (result.length > 0) {
        break;
      }
      time = Date.now();
      await sleep(10000);
    }
    return true;
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
      // check if user if enrolled
      // const domain = await getDomainName();
      // if (domain === false) {
      //   setErrorModal([
      //     "This Domain does not match the records please try again or procced to create a NFT",
      //     "Try again",
      //     "/create",
      //     "Enroll Account",
      //     "/enroll",
      //   ]);
      // } else {
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
      return imageCid;
      // }
    } catch (error) {
      console.log("err", error);
    }
  };

  // step4 //
  // creates the metadata
  const createMetadata = async (cidI: string) => {
    const prov = new ethers.providers.Web3Provider(provider);
    const NoHexAddress = address.substring(2);
    const signer = await prov.getSigner();
    const payload = {
      name: tokenData.name,
      description: tokenData.description,
      image: cidI,
      owner: address,
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
        from: address,
        signature,
        data: payload,
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
        const id = await metadata.cid;

        setTokenData({ ...tokenData, tokenCid: id });
        console.log("didCID", id);
        const dagRequest = await fetch(
          `https://api.ancon.did.pa/v0/dagjson/${id}/`
        );

        const dag = await dagRequest.json();
        let metadataCid: any;
        console.log(dag);
        let proofKey: any;
        console.log("dag", dag);
        if (dag !== null) {
          metadataCid = await Object?.values(dag.content)[0];
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
        setMessage(
          "Creating Offchain Metadata, please wait this process can take several minutes."
        );
        setStep(-1);
        let eventWaiter = await getPastEvents();
        console.log("event", eventWaiter);

        // await sleep(61000);

        const rawPostProof = await fetch(
          "https://api.ancon.did.pa/v0/dagjson",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              path: "/",
              from: address,
              signature: s,
              data: [hexdata],
            }),
          }
        );
        const postProof = await rawPostProof.json();
        const key = await postProof.cid;
        console.log("date", postProof, key);

        const rawGetProof = await fetch(
          `https://api.ancon.did.pa/v0/dagjson/${key}/`
        );
        const getProof = await rawGetProof.json();
        console.log()
        let packetId: any = await Object?.values(getProof.content)[0];
        setUser({ key: getProof.key, height: getProof.height });
        // const rawPacket = await fetch(
        //   `https://api.ancon.did.pa/v0/dagjson/${packetId}/`
        // );
        // const packet = await rawPacket.json();

        // packetId = await packet[0][0];
        // console.log('packetid', packetId, packet)
        // packetId = ethers.utils.base64.decode(packetId.bytes);
        // console.log("packet", packet, packetId);
        setPacket({ proof: getProof.proof, packet: hexdata });
        console.log("31 seconds");
        eventWaiter = await getPastEvents();
        console.log("event", eventWaiter);

        console.log("fetch", getProof);
        setMessage("Minting NFT...");
        setTokenData({
          ...tokenData,
          imageCid: cidI,
          tokenCid: metadataCid,
        });
        setStep(4);
      };
      PostRequest();
    } catch (error) {
      console.log("err", error);
      console.log("error");
      setStep(3);
    }
  };

  // step 5 //
  let web3;
  let ethersInstance;
  let signer;
  const mintNft = async () => {
    setStep(5);
    const _web3 = new Web3(provider);
    _web3.eth.defaultAccount = address;
    //setWeb3(_web3);
    web3 = _web3;
    bindContracts(web3);
  };
  console.log(step);
  async function bindContracts(web3: any) {
    console.log("Beginning of BINDCONTRACTS()");
    ethersInstance = new ethers.providers.Web3Provider(provider);
    signer = ethersInstance.getSigner();
    const network = await ethersInstance.getNetwork();

    const contractAddress: any = await GetChain(network);
    const contract1 = XDVNFT__factory.connect(
      contractAddress.xdv,
      ethersInstance
    );
    const contract2 = XDVNFT__factory.connect(
      contractAddress.xdv,
      signer
    );
    const contract3 = AnconProtocol__factory.connect(
      contractAddress.ancon,
      ethersInstance
    );

    const dai = new web3.eth.Contract(
      AnconToken.abi,
      contractAddress.dai
    );

    const allowance = await dai.methods
      .allowance(address, contract2.address)
      .call();
    if (allowance == 0) {
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
    }
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
    const Did = await GetDid(address);
    const key = Did.key;
    const height = Did.height;

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
    try {
      mint = await contract2.mintWithProof(
        packetProof.key,
        hexData,
        userProof,
        packetProof,
        hash
      );
    } catch (error) {
      mint = await contract2.mintWithProof(
        packetProof.key,
        hexData,
        userProof,
        packetProof,
        hash
      );
    }

    // mint = await contract4.submitPacketWithProof(
    //   address,
    //   userProof,
    //   packetProof.key,
    //   packet.packet,
    //   packetProof
    // );

    // let mint2;
    // try {
      // mint2 = await contract4.verifyProofWithKV(
      //   packetProof.key,
      //   packetProof.value,
      //   packetProof
      // );
    // } catch (error) {
    //   console.log("error", error);
    // }
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
    // console.log("packet", mint2);
    setStep(6);

    // createDocumentNode(web3);
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
  const handleSetMessageUpload = async () => {
    if (tokenData.name === "" || image === null) {
      setError(true);
    } else {
      setStep(2);
      const cid: any = await handleUpload();
      await createMetadata(cid);
      setError(false);
    }
  };
  console.log("image", tokenData);
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4">
          <span className="text-black font-bold text-xl">
            {step === 6 ? "NFT Created" : "Create NFT"}
          </span>
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
          {step === -1 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">{message}</p>
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
                  value={tokenData.name}
                ></input>
              </div>

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
                  value={tokenData.description}
                ></input>
              </div>
              <div
                onClick={clickInput}
                className="p-3 rounded-lg border-2 bg-gray-50 shadow-sm cursor-pointer hover:tracking-wider transition-all duration-200 hover:border-primary-500 hover:drop-shadow-lg hover:shadow-primary-500 ease-out mt-3"
              >
                <p className="flex justify-center items-center">
                  Select Image
                </p>
              </div>
              <ErrorMessage
                message="Please fill the blanks and select an Image"
                show={error}
              />
              {localImage != null ? (
                <div className="flex items-center justify-center pt-3">
                  <img
                    className="border-2 p-2 rounded-lg border-primary-500 drop-shadow-xl shadow-primary-500"
                    src={`data:image/jpeg;base64,${localImage}`}
                    style={{ maxWidth: "100px" }}
                    alt="local"
                  />
                </div>
              ) : null}
              <input
                type="file"
                onChange={onImageChange}
                className="filetype"
                id="nft-img"
                style={{ display: "none" }}
              ></input>
              <div className="flex items-center justify-center mt-3">
                <div>
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
                      onClick={() => router.push("/")}
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

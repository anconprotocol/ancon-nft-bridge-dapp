import { useRouter } from "next/router";
import React from "react";
import { useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

// components
import Header from "../components/Header";
import ErrorMessage from "../components/ErrorMessage";

// web3
import { Web3Storage } from "web3.storage";
import { ethers } from "ethers";
import useProvider from "../hooks/useProvider";
import { addressState } from "../atoms/addressAtom";
import { errorState } from "../atoms/errorAtom";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";

// functions
import toAbiProof from "../functions/ToAbiProof";
// web3
import { XDVNFT__factory } from "../types/ethers-contracts";
import Web3 from "web3";
import GetDid from "../functions/GetDid";
import GetChain from "../functions/GetChain";
import { arrayify, keccak256, toUtf8Bytes } from "ethers/lib/utils";
import AnconProtocol from "../functions/AnconProcotolClass/AnconProtocol";
import QRCode from "react-qr-code";
import { QrcodeIcon } from "@heroicons/react/solid";
import ProgressLine from "../components/ProgressLine";

//Contracts
const AnconToken = require("../contracts/ANCON.sol/ANCON.json");

// fix the type error for document in nextjs
declare let document: any;
export function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function Create() {
  // web3
  let Ancon: AnconProtocol;
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
    metadaCid: "",
  });

  const [transaction, setTransaction] = useState<any>({
    hash: "",
    value: "",
    block: "",
  });
  const [packet, setPacket] = useState({ proof: "", packet: "" });
  const [user, setUser] = useState({ key: "", height: "" });
  const [showQr, setShowQr] = useState(false);
  // atoms
  const [address, setAddress] = useRecoilState(addressState);
  const setErrorModal = useSetRecoilState(errorState);
  // const DIDcid = useRecoilValue(DidState)
  // hooks
  const router = useRouter();
  const provider: any = useProvider();
  if (provider) {
    Ancon = new AnconProtocol(provider, address);
    Ancon.initialize();
  }
  const clickInput = () => document.getElementById("nft-img").click();

  
  //step 0 //

  // STEP 0  gets the public key and handle the get did//
  const getDomainName = async () => {
    const status = await Ancon.getDomainName();
    return status;
  };

  // step 1 //

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
      ;
      const domain = await getDomainName();
      if (domain === false) {
        setErrorModal([
          "This Address does not match the records please try again or Enroll the address",
          "Try again",
          "/create",
          "Enroll Account",
          "/enroll",
        ]);
        throw "not enrolled";
      } else {
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
      }
    } catch (error) {
      console.log("err", error);
      return false;
    }
  };

  // step4 //
  // creates the metadata
  const createMetadata = async (cidI: string) => {
    setErrorModal(["Waiting for wallet action..."]);

    // prepare de payload
    const payload = {
      name: tokenData.name,
      description: tokenData.description,
      image: cidI,
      owner: address,
      sources: [],
    };

    // sign the message
    const signature = await Ancon.signer.signMessage(
      ethers.utils.arrayify(ethers.utils.toUtf8Bytes(JSON.stringify(payload)))
    );

    // hide the modal
    setErrorModal([]);

    // prepare the request
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
      // creates the metadata in ancon protocol
      const PostRequest = async () => {
        const metadata = await Ancon.postProof("dagjson", requestOptions);

        const metadataCid = metadata.contentCid;
        console.log(metadata)
        // show the modal
        setErrorModal(["Waiting for wallet action......"]);

        // hexdata
        let hexdata = ethers.utils.defaultAbiCoder.encode(
          ["address", "string"],
          [address, metadataCid]
        );

        // sign the data
        let s = await Ancon.signer.signMessage(arrayify(toUtf8Bytes(hexdata)));

        // hide the modal
        setErrorModal([]);
        console.log("61 seconds");

        setMessage(
          "Creating Metadata, please wait this process can take several minutes."
        );
        setStep(2);

        // wait for the header to change
        let eventWaiter = await Ancon.getPastEvents();
        console.log("event", eventWaiter);

        // handle the second request options
        const requestOptions2 = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "/",
            from: address,
            signature: s,
            data: hexdata,
          }),
        };

        // post the second proof
        const proof = await Ancon.postProof("dagjson", requestOptions2);
        console.log(proof)
        // save the keys
        setUser({ key: proof.proofKey, height: proof.proofHeight });
        setPacket({ ...packet, packet: hexdata });

        console.log("wait for the event");
        eventWaiter = await Ancon.getPastEvents();
        console.log("event", eventWaiter);

        setMessage("Minting NFT...");
        setTokenData({
          ...tokenData,
          imageCid: cidI,
          tokenCid: metadata.proofCid,
          metadaCid: metadata.contentCid,
        });
        setStep(3);
      };
      PostRequest();
    } catch (error) {
      console.log("err", error);
      console.log("error");
      setStep(0);
    }
  };

  const bindContracts = async () => {
    setStep(5);
    setShowQr(false);
    console.log("Beginning of BINDCONTRACTS()");
    // initalize the web3 sockets

    try {
      const mint = await Ancon.mintNft(packet.packet, user.key);
      setErrorModal([]);
      console.log(mint);
      await mint?.wait(2);
      setTransaction({
        hash: mint?.hash,
        value: mint?.value._hex,
        block: mint?.blockNumber,
      });
      setStep(6);
    } catch (error) {
      setErrorModal([
        "Something went wrong please try again",
        "Try again",
        "/create",
        "Enroll Account",
        "/enroll",
      ]);
    }
  };

  //
  // handles the change of the image
  const onImageChange = (event: React.ChangeEvent<HTMLInputElement> | any) => {
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
      setStep(1);
      const cid: any = await handleUpload();
      if (cid !== false) {
        await createMetadata(cid);
      }
      setError(false);
    }
  };

  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />

      <div className="flex justify-center items-center md:mt-18 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4 w-11/12 md:w-6/12 2xl:w-5/12">
          <ProgressLine steps={6} step={step} />
          <div className="text-black font-bold text-xl flex">
            {step === 0
              ? "Create NFT"
              : step === 4
              ? "Metadata Created"
              : step === 6
              ? "NFT Minted"
              : "Creating NFT"}
            {step === 3 || step === 6 ? (
              <div
                className="ml-3 flex items-center cursor-pointer hover:scale-125 transform transition-all ease-in"
                onClick={() => setShowQr(true)}
              >
                <QrcodeIcon className="w-5" />
                <span className="text-gray-500 font-light text-xs">
                  show qr
                </span>
              </div>
            ) : null}
          </div>

          {step === 1 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">Uploading Image to IPFS</p>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">{message}</p>
            </div>
          ) : null}
          {step == 0 ? (
            <div className="flex-col flex mt-3 w-full">
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-sm font-bold">NFT Name</a>
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
                <a className="text-gray-600 text-sm font-bold">Description</a>
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
              <div className="flex justify-center items-center mt-6">
                <p
                  onClick={clickInput}
                  className="flex justify-center items-center p-3 rounded-lg border-2 bg-gray-50 shadow-sm cursor-pointer hover:tracking-wider transition-all duration-200 hover:border-primary-500 hover:drop-shadow-lg hover:shadow-primary-500 ease-out"
                >
                  Select Image
                </p>
              </div>
              <div className="flex items-center justify-center mt-6">
                <ErrorMessage
                  message="Please fill the blanks and select an Image"
                  show={error}
                />
              </div>

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
          {step === 4 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">{message}</p>
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
          {step == 3 ? (
            <div className="grid grid-cols-1 space-y-2">
              <div className="my-3">
                <p className="text-lg font-medium">
                  The Metadata has been stored, do you want to mint a NFT with
                  this metadata?
                </p>
              </div>

              {/* name */}
              <div className="">
                <span className="text-gray-600 text-sm">NFT Name</span>
                <p className="text-md font-medium">{tokenData.name}</p>
              </div>

              {/* description */}
              <div className="">
                <span className="text-gray-600 text-sm">Description</span>
                <p className="text-md font-medium truncate">
                  {tokenData.description}
                </p>
              </div>

              {/* image */}
              <div
                className=""
                onClick={() =>
                  navigator.clipboard.writeText(tokenData.imageCid)
                }
              >
                <span className="text-gray-600 text-sm">Image CID</span>
                <p className="text-md font-medium truncate">
                  {tokenData.imageCid}
                </p>
              </div>

              {/* Metadata Cid */}
              <div
                className=""
                onClick={() =>
                  navigator.clipboard.writeText(tokenData.tokenCid)
                }
              >
                <span className="text-gray-600 text-sm">Metadata CID</span>
                <p className="text-md font-medium truncate">
                  {tokenData.tokenCid}
                </p>
              </div>

              {/* image to show */}
              <div className="flex items-center justify-center mt-3 w-full">
                <div className="grid grid-cols-1 w-full place-items-center">
                  <img
                    className="nft-img"
                    src={`data:image/jpeg;base64,${localImage}`}
                    style={{ maxWidth: "120px" }}
                    alt="readyLocal"
                  />
                  <p
                    onClick={() => bindContracts()}
                    className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 w-1/4"
                  >
                    Mint
                  </p>

                  {/* qr code */}
                  {showQr && (
                    <div
                      className="pb-3 mt-4"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_env}/qrview?address=${address}&did=${tokenData.metadaCid}&cid=${tokenData.tokenCid}`
                        )
                      }
                    >
                      <QRCode
                        value={`${process.env.NEXT_PUBLIC_env}/qrview?address=${address}&did=${tokenData.metadaCid}&cid=${tokenData.tokenCid}`}
                        size={150}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          {step == 6 ? (
            <div className="grid grid-cols-1 space-y-2">
              <div className="my-3">
                <p className="text-lg font-medium">
                  The NFT has been minted, take a screenshot or save the QR
                </p>
              </div>

              {/* name */}
              <div className="">
                <span className="text-gray-600 text-sm">NFT Name</span>
                <p className="text-md font-medium">{tokenData.name}</p>
              </div>

              {/* description */}
              <div className="">
                <span className="text-gray-600 text-sm">Description</span>
                <p className="text-md font-medium truncate">
                  {tokenData.description}
                </p>
              </div>

              {/* image */}
              <div className="">
                <span className="text-gray-600 text-sm">Image CID</span>
                <p className="text-md font-medium truncate">
                  {tokenData.imageCid}
                </p>
              </div>

              {/* Metadata Cid */}
              <div className="">
                <span className="text-gray-600 text-sm">Metadata CID</span>
                <p className="text-md font-medium truncate">
                  {tokenData.tokenCid}
                </p>
              </div>

              {/* transaction Hash */}
              <div className="">
                <span className="text-gray-600 text-sm">Transaction Hash</span>
                <p className="text-md font-medium truncate">
                  {transaction.hash}
                </p>
              </div>

              {/* Transaction Block */}
              <div className="">
                <span className="text-gray-600 text-sm">Transaction Block</span>
                <p className="text-md font-medium truncate">
                  {transaction.block}
                </p>
              </div>

              {/* Transaction from */}
              <div className="">
                <span className="text-gray-600 text-sm">From</span>
                <p className="text-md font-medium truncate">{address}</p>
              </div>

              {/* image to show */}
              <div className="flex items-center justify-center mt-3 w-full">
                <div className="grid grid-cols-1 w-full place-items-center">
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
                  {/* qr code */}
                  {showQr && (
                    <div
                      className="pb-3 mt-4"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_env}/qrview?address=${address}&did=${tokenData.metadaCid}&cid=${tokenData.tokenCid}`
                        )
                      }
                    >
                      <QRCode
                        value={`${process.env.NEXT_PUBLIC_env}/qrview?address=${address}&did=${tokenData.metadaCid}&cid=${tokenData.tokenCid}`}
                        size={150}
                      />
                    </div>
                  )}
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

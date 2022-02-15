import { ethers } from "ethers";
import {  useRouter } from "next/router";
import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { addressState } from "../atoms/addressAtom";
import { errorState } from "../atoms/errorAtom";
import Header from "../components/Header";
import getTransaction from "../functions/GetTransaction";
import useProvider from "../hooks/useProvider";
import Step0 from "../sections/enroll/EnrollStep0";
import EnrollStep2 from "../sections/enroll/EnrollStep2";
import AnconProtocol from "../functions/AnconProcotolClass/AnconProtocol";
import Web3 from "web3";

function Enroll() {
  // web3
  let signer: ethers.providers.JsonRpcSigner;
  let network: ethers.providers.Network;
  const apiEndpoint: string = process.env.NEXT_PUBLIC_API_CALL as string;
  // state
  const [step, setStep] = useState(0);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [DIDCid, setDIDCid] = useState("");

  // atoms
  const address: any = useRecoilValue(addressState);

  const [errorModal, setErrorModal] = useRecoilState(errorState);

  //custom hooks
  const provider = useProvider();

  const router = useRouter();

  // ancon
  let Ancon: AnconProtocol;

  /*
   step 0 
   */
  // check if domain already exists
  const getDomainName = async () => {
    const prov = new ethers.providers.Web3Provider(provider);

    // get the network
    const network = await prov.getNetwork();

    const rawResponse = await fetch(
      `https://tensta.did.pa/v0/did/did:ethr:${network.name}:${address}`
    );
    const response = await rawResponse.json();
    console.log("response", rawResponse);
    if (rawResponse.status === 400) {
      return false;
    }
    return false;
  };

  /*
   step 1
  gets the public key and handle the get did
   */

  //get the public key
  const getKey = async () => {
    // check if theres a name written
    try {
      setStep(1);
      const domain = await getDomainName();
      if (domain === false) {
        // check if the user has made any transaction
        const trans = await getTransaction(
          setStep,
          address,
          setErrorModal,
          setMessage,
          provider
        );

        Ancon = new AnconProtocol(
          provider,
          address,
          Web3.utils.keccak256("tensta"),
          apiEndpoint
        );
        await Ancon.initialize();
        
        // the pubkey from ancon
        const getPubKey = await Ancon.getPubKey(trans);

        
        const pubkey = getPubKey[2];
        const recoveredAddress = getPubKey[0];
        const sentAddress = getPubKey[1];

        setMessage("Validating proof...");
        // if the address are equal procced to get the proof
        if (recoveredAddress === sentAddress) {
        setTimeout(() => {
          handleProof(pubkey);
        }, 2000);
        } else {
          setError(true);
        }
      } else {
        setErrorModal([
          "This Address is already enrolled please try again with another one or procced to create a NFT",
          "Try again",
          "/enroll",
          "Create NFT",
          "/create",
        ]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  //get the cid and the proof
  const handleProof = async (pubkey: string) => {
    // encode the pub key
    const base58Encode = ethers.utils.base58.encode(pubkey);

    const message = `#Welcome to Ancon Protocol!
    
    For more information read the docs https://anconprotocol.github.io/docs/
    
    To make free posts and gets to the DAG Store you have to enroll and pay the service fee

    This request will not trigger a blockchain transaction or cost any gas fees.
    by signing this message you accept the terms and conditions of Ancon Protocol
    `;

    const signature = await Ancon.signer.signMessage(
      ethers.utils.arrayify(ethers.utils.toUtf8Bytes(message))
    );
    //post to get the did
    const payload = {
      ethrdid: `did:ethr:${Ancon.network.name}:${address}`,
      pub: base58Encode,
      signature: signature,
      message: message,
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
    try {
      const getDid = async () => {
        // post the data
        console.log('posting')
        const data = await Ancon.postProof(
          "did",
          requestOptions,
          true
        );
        console.log("data", data);

        //save the cid to state
        setDIDCid(data.contentCid);

        const proof = await Ancon.getProof(
          data.proofKey,
          data.proofHeight
        );
        console.log("getproff", proof);

        // enroll to L2
        let enroll;
        console.log("did", data);
        setMessage(
          "Preparing to enroll the account, please wait this proccess can take several minutes"
        );
        setTimeout(async () => {
          enroll = await Ancon.enrollL2Account(
            data.contentCid,
            proof
          );
          setStep(2);
        }, 30000);
      };

      getDid();
      // setStep(3)
    } catch (error) {
      console.log("err", error);
    }
  };
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4 mx-2">
          <span className="text-black font-bold text-xl">
            {/* title */}
            {step === 2
              ? "Account enrolled"
              : step === 1
              ? "Enrollment Proccess"
              : "Enroll Account"}
          </span>
          {step === 0 ? <Step0 func={getKey} /> : null}
          {/* loading screen */}
          {step === 1 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">{message}</p>
            </div>
          ) : null}

          {/* step 3 account enrolled create nft */}
          {step === 2 ? (
            <EnrollStep2
              router={router}
              address={address}
              DIDCid={DIDCid}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default Enroll;

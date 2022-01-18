import { ethers } from "ethers";
import { Router, useRouter } from "next/router";
import { useState } from "react";
import {
  useRecoilState,
  useRecoilValue,
} from "recoil";
import { addressState } from "../atoms/addressAtom";
import { errorState } from "../atoms/errorAtom";
import Header from "../components/Header";
import EnrollL2Account from "../functions/EnrollL2Account";
import GetPublicKey from "../functions/GetPublicKey";
import getTransaction from "../functions/GetTransaction";
import toAbiProof from "../functions/ToAbiProof";
import useProvider from "../hooks/useProvider";
import GetDid from "../functions/GetDid";


function Enroll() {
  // web3
 let prov: ethers.providers.Web3Provider;
 let signer: ethers.providers.JsonRpcSigner;
 let network:ethers.providers.Network;
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

  /*
   step 0 
   */
  // check if domain already exists
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
    return false;
  };


  /*
   step 1
  gets the public key and handle the get did
   */

  //get the public key
  const getDid = async () => {
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
        //create provider
        prov = new ethers.providers.Web3Provider(provider);
        // get a transaction
        const transaction: any = await prov.getTransaction(trans);
        
        // join the signature
        const sig = ethers.utils.joinSignature({
          r: transaction.r,
          s: transaction.s,
          v: transaction.v,
        });

        // get publicKey
        const getPublicKey = await GetPublicKey(
          transaction,
          sig,
          prov
        );
        const pubkey = getPublicKey[1];
        const recoveredAddress = getPublicKey[0];
        setMessage("Validating proof...");
        // if the address are equal procced to get the proof
        if (recoveredAddress === transaction.from) {
          setTimeout(() => {
            handleProof(pubkey);
          }, 2000);
        } else {
          setError(true);
        }
      } else {
        setErrorModal([
          "This Domain already exists please try again with another one or procced to create a NFT",
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

    // take out the 0x from the address
    const NoHexAddress = address.substring(2);

    // initialize the signer
    signer = prov.getSigner();

    // get the network
    network = await prov.getNetwork();

    const signature = await signer.signMessage(
      ethers.utils.arrayify(
        ethers.utils.toUtf8Bytes(
          "signin this message to verify my public key"
        )
      )
    );
    //post to get the did
    const payload = {
      domainName: NoHexAddress,
      pub: base58Encode,
      signature: signature,
      message: "signin this message to verify my public key",
    };
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
    try {
      const getDid = async () => {
        // post the data
        const rawdata = await fetch(
          "https://api.ancon.did.pa/v0/did/web",
          requestOptions
        );
        const data = await rawdata.json();
        let cid: any = data.cid;
        //save the cid to state
        setDIDCid(cid);

        const rawdid = await GetDid(address);
        const did:any = await Object?.values(rawdid.content)[0];

        const rawGetProof = await fetch(
          `https://api.ancon.did.pa/v0/proof/${rawdid.key}?height=${rawdid.height}`
        );
        const GetProof = await rawGetProof.json();
        
        // calling to abi proof
        const z = toAbiProof({
          ...GetProof[0].Proof.exist,
        });

        // enroll to L2
        let enroll;
        setMessage(
          "Preparing to enroll the account, please wait this proccess can take several minutes"
        );
        setTimeout(async () => {
          enroll = await EnrollL2Account(
            did,
            z,
            setStep,
            prov,
            signer,
            setErrorModal,
            address,
            provider,
            network
          );
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
            {step === 3
              ? "Account enrolled"
              : step === 1
              ? "Enrollment Proccess"
              : "Enroll Account"}
          </span>
          {step === 0 ? (
            <div className="mt-4 flex flex-col items-center select-none">
              <p className="font-medium">
                Claim L2 Decentralized Identity
              </p>
              <div
                onClick={getDid}
                className="mt-4 bg-purple-700 border-2 border-purple-700 rounded-lg px-4 py-2 text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer"
              >
                <p>Claim</p>
              </div>
            </div>
          ) : null}
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
          {step === 3 ? (
            <div className="flex items-center justify-center mt-3">
              <div className="grid grid-cols-1">
                <a className="text-gray-600 text-sm">Domain Name</a>
                <span className="text-lg font-medium mb-2">
                  {address}
                </span>

                <a className="text-gray-600 text-sm">DID Cid</a>
                <p className="hidden md:inline text-lg font-medium mb-2">
                  {DIDCid}
                </p>
                <p className="md:hidden text-lg">
                  {DIDCid.substring(0, 30)}...
                </p>
                <p className="md:hidden text-lg">
                  ...{DIDCid.substring(30)}
                </p>

                <div className="flex items-center justify-center mt-3 w-full">
                  <div>
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

export default Enroll;

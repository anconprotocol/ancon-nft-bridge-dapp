import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import Web3 from "web3";
import { addressState } from "../atoms/addressAtom";
import Header from "../components/Header";
import GetChain from "../functions/GetChain";
import GetDid from "../functions/GetDid";
import GetPastEvents from "../functions/GetPastEvents";
import toAbiProof from "../functions/ToAbiProof";
import useProvider from "../hooks/useProvider";
import { AnconProtocol__factory, WXDV__factory, XDVNFT, XDVNFT__factory } from "../types/ethers-contracts";
const AnconToken = require("../contracts/ANCON.sol/ANCON.json");
export default function Release() {
  // release the token
  const address = useRecoilValue(addressState);
  const [step, setStep] = useState(0);
  const [transactionHash, setTransactionHash] = useState("");
  const router = useRouter();
  const provider = useProvider();
  const { cid, network, transaction, tokenId, oldOwner }: any =
    router.query;
  const releaseToken = async () => {
    setStep(1);
    // instiate the providers
    const prov = new ethers.providers.Web3Provider(provider);
    const web3 = new Web3(provider);
    web3.eth.defaultAccount = address;
    const signer = await prov.getSigner();
    const Network = await prov.getNetwork();
    const contractAddresses = await GetChain(Network);

    // instiate the contracts

    const xdvReader = XDVNFT__factory.connect(
      contractAddresses.xdv,
      prov
    );
    const xdvSigner = XDVNFT__factory.connect(
      contractAddresses.xdv,
      signer
    );
    const protocol = AnconProtocol__factory.connect(
      contractAddresses.ancon,
      prov
    );
    const wxdv =  WXDV__factory.connect(contractAddresses.wxdv, signer);
    const contractId = await protocol.getContractIdentifier();  // create the data and sign it
    const hexdata = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "string", "address","bytes32"],
      [parseInt(tokenId), cid, address, contractId]
    );
    const hash = ethers.utils.solidityKeccak256(
      ["uint256", "string", "address","bytes32"],
      [parseInt(tokenId), cid, address, contractId]
    );

    // sign the data
    const s = await signer.signMessage(
      ethers.utils.arrayify(
        ethers.utils.toUtf8Bytes(JSON.stringify([hexdata]))
      )
    );

    // post the new proof
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

    // fetch the proof
    const rawGetProof = await fetch(
      `https://api.ancon.did.pa/v0/dagjson/${key}/`
    );
    const getProof = await rawGetProof.json();
    console.log("getproff", getProof);
    const newCid = await Object?.values(getProof.content)[0];
    const packetKey = getProof.key;
    const packetHeight = getProof.height;

    /*
  prepare proofs 
  */
    // get the key and height
    const did = await GetDid(Network.name,address);
    //  packet proof
    const rawPacketProof = await fetch(
      `https://api.ancon.did.pa/v0/proof/${packetKey}?height=${packetHeight}`
    );
    let packetProof = await rawPacketProof.json();
    packetProof = toAbiProof({ ...packetProof[0].Proof.exist });

    //  user proof
    const rawUserProof = await fetch(
      `https://api.ancon.did.pa/v0/proof/${did.key}?height=${packetHeight}`
    );
    let userProof = await rawUserProof.json();
    userProof = toAbiProof({ ...userProof[0].Proof.exist });

    // wait for the relayer to account
    const eventWaiter = await GetPastEvents(
      prov,
      contractAddresses.ancon
    );

    // check allowance
    const dai = new web3.eth.Contract(
      AnconToken.abi,
      contractAddresses.dai
    );
    const allowance = await dai.methods
      .allowance(address, protocol.address)
      .call();
    if (allowance == 0) {
      const tx = await dai.methods
        .approve(protocol.address, "1000000000000000000")
        .send({
          gasPrice: "50000000000",
          gas: 400000,
          from: address,
        });
      
      await tx.wait(1);
    }
    //   await dai.methods
    //     .approve(xdvSigner.address, "1000000000000000000000")
    //     .send({
    //       gasPrice: "400000000000",
    //       gas: 400000,
    //       from: address,
    //     });
    // }
    try {
      const release = await xdvSigner.releaseWithProof(
        packetProof.key,
        packetProof.value,
        userProof,
        packetProof,
        hash,{
          gasPrice: "50000000000",
          gasLimit: 400000,
          from: address,
        }
      );
      await release.wait(2);
      setTransactionHash(release.hash);
      setStep(2);
      console.log("release", release);
    } catch (error) {
      console.log("error", error);
    }
  };
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4 mx-2">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4">
          <span className="text-black font-bold text-xl">
            Release Token
          </span>
          {step === 0 ? (
            <div>
              {/* network */}
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  New Network
                </a>
                <p>
                  {network === "bnbt"
                    ? "Binance SC Testnet"
                    : "Kovan Testnet"}
                </p>
              </div>
              {/* nft */}
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  Lock Transaction Hash
                </a>
                <p>{transaction}</p>
              </div>
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  New Owner
                </a>
                <p>{address}</p>
              </div>
              {/* token id */}
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  Previous Owner
                </a>
                <p>{oldOwner}</p>
              </div>
              <div>
                <p
                  onClick={releaseToken}
                  className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 select-none"
                >
                  Release
                </p>
              </div>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">
                Wait for a few minutes while we release the token...
              </p>
            </div>
          ) : null}
          {step === 2 ? (
            <div>
              {/* network */}
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  Network
                </a>
                <p>
                  {network === "bnbt"
                    ? "Binance SC Testnet"
                    : "Kovan Testnet"}
                </p>
              </div>
              {/* nft */}
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  Release Transaction Hash
                </a>
                <p>{transactionHash}</p>
              </div>
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  New Owner
                </a>
                <p>{address}</p>
              </div>
              {/* token id */}

              <p
                onClick={() => router.push("/")}
                className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 select-none"
              >
                Close
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

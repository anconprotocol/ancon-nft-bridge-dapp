
import { ethers } from "ethers";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { addressState } from "../atoms/addressAtom";
import Header from "../components/Header";
import Step0 from "../sections/swap/Step0";
import GetChain from "../functions/GetChain";
import useProvider from "../hooks/useProvider";
import { XDVNFT__factory } from "../types/ethers-contracts";
import Step1 from "../sections/swap/Step1";
import Step3 from "../sections/swap/Step3";
import Web3 from "web3";
import toAbiProof from "../functions/ToAbiProof";
import GetDid from "../functions/GetDid";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";
import { sleep } from "./create";
import { ChevronDownIcon } from "@heroicons/react/solid";
const AnconToken = require("../contracts/ANCON.sol/ANCON.json");
// swap
function Swap() {
  const provider = useProvider();
  let prov: any;
  let Network: any;
  let signer: any;
  let web3: any;
  let contractAddresses: any;
  const [step, setStep] = useState(0);
  const [nftAddress, setNftAddress] = useState(
    "0x31388941eebad128d7eabd5d529de1a61c0f6625"
  );
  const [owner, setOwner] = useState(
    "0x2a3D91a8D48C2892b391122b6c3665f52bCace23"
  );
  const [tokenId, setTokenId] = useState("");
  const [network, setNetwork] = useState("Network");
  const [proofs, setProofs] = useState({
    userProof: "",
    packetProof: "",
    packetKey: "",
    packetHeight: "",
  });
  const [showDropdown, setShowDropdown] = useState("hidden");
  const address = useRecoilValue(addressState);

  /* handles the drop function */
  const handleDrop = () => {
    switch (showDropdown) {
      case "hidden":
        setShowDropdown("show");
        break;
      case "show":
        setShowDropdown("hidden");
        break;
    }
  };
  const next = async () => {
    setStep(1);
  };
  const getPastEvents = async () => {
    const contract1 = AnconProtocol__factory.connect(
      contractAddresses.ancon,
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
  const swap = async () => {
    setStep(2);
    prov = new ethers.providers.Web3Provider(provider);
    web3 = new Web3(provider);
    web3.eth.defaultaccount = address;
    signer = await prov.getSigner();
    Network = await prov.getNetwork();
    contractAddresses = await GetChain(Network);
    // debugger
    const contract3 = XDVNFT__factory.connect(
      contractAddresses.xdv,
      prov
    );
    const contract2 = XDVNFT__factory.connect(
      contractAddresses.xdv,
      signer
    );
    const contract1 = AnconProtocol__factory.connect(
      contractAddresses.ancon,
      prov
    );
    const contract = AnconProtocol__factory.connect(
      contractAddresses.ancon,
      signer
    );

    const tokenUri = await contract3.tokenURI(parseInt(tokenId));

    const rawMetadaUri = await fetch(
      `https://api.ancon.did.pa/v0/dagjson/${tokenUri}/?namespace=anconprotocol/users/${address}`
    );

    const metadaUri = await rawMetadaUri.json();
    console.log("metadata uri", tokenUri, metadaUri);
    const payload = [
      {
        path: "owner",
        previousValue: address,
        nextValue: address,
      },
    ];

    // sign the message
    const signature = await signer.signMessage(
      ethers.utils.arrayify(
        ethers.utils.toUtf8Bytes(JSON.stringify(payload))
      )
    );

    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/",
        from: address,
        signature,
        data: payload,
        cid: tokenUri,
      }),
    };
    const rawPut = await fetch(
      `https://api.ancon.did.pa/v0/dag`,
      requestOptions
    );
    const put = await rawPut.json();
    console.log("put", put);

    const rawGetProof = await fetch(
      `https://api.ancon.did.pa/v0/dagjson/${put.cid}/?namespace=anconprotocol/users/${address}`
    );
    const getProof = await rawGetProof.json();
    let cid: any = await Object?.values(getProof.content)[0];
    let hexdata = ethers.utils.defaultAbiCoder.encode(
      ["uint256"],
      [parseInt(tokenId)]
    );
    console.log("getProof", getProof);

    let eventWaiter = await getPastEvents();
    let packetKey = getProof.key;
    let packetHeight = getProof.height;

    let hash = ethers.utils.solidityKeccak256(
      ["uint256"],
      [parseInt(tokenId)]
    );
    /*
    prepare proofs 
    */
    // get the key and height
    const did = await GetDid(address);
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
    const relayHash = await contract1.getProtocolHeader();
    console.log("relay hash", relayHash);
    // check allowance
    const dai = new web3.eth.Contract(
      AnconToken.abi,
      contractAddresses.dai
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

    /* call the contract */
    try {
      const mint2 = await contract1.verifyProofWithKV(
        packetProof.key,
        packetProof.value,
        packetProof
      );
      console.log("mint2", mint2);
      const mint = await contract1.verifyProofWithKV(
        userProof.key,
        userProof.value,
        userProof
      );
      console.log("mint1", mint);
      const lock = await contract2.lockWithProof(
        packetProof.key,
        hexdata,
        userProof,
        packetProof,
        hash
      );

      console.log("lock", lock);

      hexdata = ethers.utils.defaultAbiCoder.encode(
        ["uint256", "string", "address"],
        [parseInt(tokenId), cid, address]
      );
      hash = ethers.utils.solidityKeccak256(
        ["uint256", "string", "address"],
        [parseInt(tokenId), cid, address]
      );

      let s = await signer.signMessage(
        ethers.utils.arrayify(
          ethers.utils.toUtf8Bytes(JSON.stringify([hexdata]))
        )
      );
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

      const rawGetProof = await fetch(
        `https://api.ancon.did.pa/v0/dagjson/${key}/`
      );
      const getProof = await rawGetProof.json();
      cid = await Object?.values(getProof.content)[0];
      packetKey = getProof.key;
      packetHeight = getProof.height;

      /*
    prepare proofs 
    */
      // get the key and height
      const did = await GetDid(address);
      //  packet proof
      const rawPacketProof = await fetch(
        `https://api.ancon.did.pa/v0/proof/${packetKey}?height=${packetHeight}`
      );
      packetProof = await rawPacketProof.json();
      packetProof = toAbiProof({ ...packetProof[0].Proof.exist });

      //  user proof
      const rawUserProof = await fetch(
        `https://api.ancon.did.pa/v0/proof/${did.key}?height=${packetHeight}`
      );
      userProof = await rawUserProof.json();
      userProof = toAbiProof({ ...userProof[0].Proof.exist });
      eventWaiter = await getPastEvents();
      const release = await contract2.releaseWithProof(
        packetProof.key,
        hexdata,
        userProof,
        packetProof,
        hash
      );
      console.log("release", release);
    } catch (error) {
      console.log("error", error);
    }

    setStep(3);
  };
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4">
          <span className="text-black font-bold text-xl">
            {step === 1 ? "Target" : "Source"}
          </span>

          {step === 0 ? (
            <>
            {/* network */}
            <div className="flex-col flex mt-3">
              <div className="inline-block relative">
                <button
                  className="bg-primary-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center shadow-md justify-between"
                  onClick={handleDrop}
                >
                  <span className="mr-1">{network}</span>
                  <ChevronDownIcon className="w-8 text-white"/>
                </button>
      
                <ul
                  className={`absolute text-white pt-1 ${showDropdown} transition-all duration-150`}
                >
                  <li
                    className=""
                    onClick={() => (setNetwork("bnbt"), handleDrop())}
                  >
                    <a
                      className="rounded-t bg-primary-600 hover:bg-primary-500 py-2 px-4 block whitespace-no-wrap transition-all duration-250 ease-out"
                      href="#"
                    >
                      Binance Smart Chain Tesnet
                    </a>
                  </li>
                  <li
                    className=""
                    onClick={() => (setNetwork("kovan"), handleDrop())}
                  >
                    <a
                      className="bg-primary-600 hover:bg-primary-500  py-2 px-4 block whitespace-no-wrap rounded-b transition-all duration-250 ease-out"
                      href="#"
                    >
                      Kovan Testnet
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            {/* nft */}
            <div className="flex-col flex mt-3">
              <a className="text-gray-600 text-sm font-bold">NFT Address</a>
              <input
                type="text"
                className="bg-gray-100 rounded-sm h-10 pl-2 shadow-sm"
                onChange={(e) => {
                  setNftAddress(e.target.value);
                }}
                value={nftAddress}
              ></input>
            </div>
            {/* token id */}
            <div className="flex-col flex mt-3">
              <a className="text-gray-600 text-sm font-bold">Token ID</a>
              <input
                type="text"
                className="bg-gray-100 rounded-sm h-10 pl-2 shadow-sm"
                onChange={(e) => {
                  setTokenId(e.target.value);
                }}
                value={tokenId}
              ></input>
            </div>
            <div>
              <p
                onClick={next}
                className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 select-none"
              >
                Next
              </p>
            </div>
          </>
          ) : null}

          {step === 1 ? (
            <Step1
              handleDrop={handleDrop}
              network={network}
              showDropdown={showDropdown}
              setNetwork={setNetwork}
              setNftAddress={setNftAddress}
              nftAddress={nftAddress}
              swap={swap}
              tokenId={tokenId}
              owner={owner}
              setOwner={setOwner}
            />
          ) : null}
          {/* loading screen */}
          {step === 2 ? (
            <div className="flex flex-col items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-dashed border-primary-500 mt-4"
                role="status"
              ></div>
              <p className="animate-pulse mt-4">
                Wait for a few minutes while we complete the
                transfer...
              </p>
            </div>
          ) : null}
          {step === 3 ? (
            <Step3
              network={network}
              nftAddress={nftAddress}
              address={address}
              tokenId={tokenId}
              owner={owner}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default Swap;

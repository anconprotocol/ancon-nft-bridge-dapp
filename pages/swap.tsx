import { ethers } from "ethers";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { addressState } from "../atoms/addressAtom";
import Header from "../components/Header";

import GetChain from "../functions/GetChain";
import useProvider from "../hooks/useProvider";
import { WXDV__factory, XDVNFT, XDVNFT__factory } from "../types/ethers-contracts";
import Step1 from "../sections/swap/Step1";
import Step3 from "../sections/swap/Step3";
import Web3 from "web3";
import toAbiProof from "../functions/ToAbiProof";
import GetDid from "../functions/GetDid";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";
import { sleep } from "./create";
import Step2 from "../sections/swap/Step2";
import Dropdown from "../components/Dropdown";

import Step5 from "../sections/swap/Step5";
import Step4 from "../sections/swap/Step4";
import { useRouter } from "next/router";
import GetPastEvents from "../functions/GetPastEvents";
import { keccak256 } from "ethers/lib/utils";

const AnconToken = require("../contracts/ANCON.sol/ANCON.json");
// swap

interface web {
  network?: ethers.providers.Network;
  contracts: {
    wxdv:string;
    xdv: string;
    ancon: string;
    dai: string;
  };
}
function Swap() {
  const provider = useProvider();
  const [step, setStep] = useState(-1);
  const [nftAddress, setNftAddress] = useState(
    ""
  );
  const [owner, setOwner] = useState(
    ""
  );
  const [tokenId, setTokenId] = useState("");
  const [network, setNetwork] = useState("Network");
  const [CID, setCID] = useState("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const address = useRecoilValue(addressState);
  // web3
  const [chain, setChain] = useState();

  const [web, setWeb] = useState<web>({
    contracts: {
      xdv: "",
      ancon: "",
      dai: "",
      wxdv: "",
    },
  });
const router = useRouter()
  // checks if the token is locked
  const checkToken = async () => {
    const prov = new ethers.providers.Web3Provider(provider);
    const Network = await prov.getNetwork();

    const contractAddresses = await GetChain(Network);
    setWeb({ network: Network, contracts: contractAddresses });



    // TODO Move to GetChain
    let rpc =  "https://data-seed-prebsc-1-s1.binance.org:8545/"
      
    if (Network.chainId === 97) {
      // no op
    } else if (Network.chainId === 42) {
      rpc='https://kovan.infura.io/v3/92ed13edfad140409ac24457a9c4e22d'
      
    } else if (Network.chainId === 80001) {
      rpc='https://matic-mumbai.chainstacklabs.com'
      
    } else if (Network.chainId === 100) {
      rpc='https://rpc.gnosischain.com/'
      
    } else if (Network.chainId === 1313161555) {
      rpc='https://testnet.aurora.dev/'
      
    }
    let tempProv = new ethers.providers.JsonRpcProvider(rpc);
     
    // if there is any transaction hash written look for the lock
    if (transactionHash) {
      try {
        const trans: any = await tempProv.getTransactionReceipt(
          transactionHash
        );
        console.log(trans, "trans");
        const xdvnftContract = XDVNFT__factory.connect(
          contractAddresses.xdv,
          tempProv
        );

        setNetwork('bnbt')
        
      } catch (error) {
        console.log("not lock");
      }
    } else {
      setStep(0);
    }
  };

  const next = async () => {
    setStep(1);
  };

  const getPastEvents = async () => {
    const getProv = new ethers.providers.Web3Provider(provider);
    const contract1 = AnconProtocol__factory.connect(
      web.contracts.ancon,
      getProv
    );
    const filter = contract1.filters.HeaderUpdated();
    const from = await getProv.getBlockNumber();
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

  const test = async () => {
    setStep(2);
    await sleep(10000);
    setStep(3);
  };
  const LockToken = async () => {
    setStep(2);
    // instiate the provider
    const prov = new ethers.providers.Web3Provider(provider);
    const web3 = new Web3(provider);
    web3.eth.defaultAccount = address;
    const signer = await prov.getSigner();
    console.log('signer', signer)
    const contract3 = XDVNFT__factory.connect(
      web.contracts.xdv,
      prov
    );
    const contract2 = XDVNFT__factory.connect(
      web.contracts.xdv,
      signer
    );
    const protocol = AnconProtocol__factory.connect(
      web.contracts.ancon,
      prov
    );
    const dai = new web3.eth.Contract(
      AnconToken.abi,
      web.contracts.dai
    );
    // get the tokenUri
    const tokenUri = await contract3.tokenURI(parseInt(tokenId));
      console.log('token uri', tokenUri)
    // check if the metadata resolves
    try {
      const rawMetadaUri = await fetch(
        `https://api.ancon.did.pa/v0/dagjson/${tokenUri}/?namespace=anconprotocol/users/${address}`
      );
    } catch (error) {
      setStep(-1);
      return "error metadata";
    }

    // prepare the payload
    const payload = [
      {
        path: "owner",
        previousValue: address,
        nextValue: owner,
      },
    ];

    // sign the payload
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
    // make a put to the dag
    const rawPut = await fetch(
      `https://api.ancon.did.pa/v0/dag`,
      requestOptions
    );
    const put = await rawPut.json();

    // fetch the proof with the put cid
    const rawGetProof = await fetch(
      `https://api.ancon.did.pa/v0/dagjson/${put.cid}/?namespace=anconprotocol/users/${address}`
    );
    const getProof = await rawGetProof.json();

    // extract the put and save it
    let cid: any = await Object?.values(getProof.content)[0];
    setCID(cid);

    // extract the key and height from the packet
    const packetKey = getProof.key;
    const packetHeight = getProof.height;
    const contractId = await protocol.getContractIdentifier();

    // encode the hexdata to be sent and hash it
    let hexdata = ethers.utils.defaultAbiCoder.encode(
      ["uint256","string", "bytes32"],
      [parseInt(tokenId),cid, contractId]
    );
    let hash = ethers.utils.solidityKeccak256(
      ["uint256", "string","bytes32"],
      [parseInt(tokenId), cid,contractId]
    );
      const net = await prov.getNetwork()

      // router.push({pathname: '/release', query: {
      //   cid,
      //   transaction: transactionHash,
      //   network: net.chainId
      // }})
    // wait for the relay
    let eventWaiter = await GetPastEvents(prov,web.contracts.ancon);
    

    /*
    prepare proofs 
    */
    // get the key for the user
    const did = await GetDid(net.name,address);

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


    // check allowance
    
    const allowance = await dai.methods
      .allowance(address, protocol.address)
      .call();
    if (allowance == 0) {
      // const tx = await dai.methods
      //   .approve(protocol.address, "1000000000000000000")
      //   .send({
      //     gasPrice: "22000000000",
      //     gas: 400000,
      //     from: address,
      //   });
      // await tx.wait(1);
    }

    /* call the contract */
    try {
      const lock = await contract2.lockWithProof(
        hexdata,
        userProof,
        packetProof,
      );
      await lock.wait(1);
      console.log("lock");
      setTransactionHash(lock.hash)

    } catch (error) {
      console.log("error", error);
    }
    setStep(3);
  };
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4 mx-2">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4">
          <span className="text-black font-bold text-xl">
            {step === 1
              ? "Transfer Metadata To"
              : step === 3
              ? "NFT sent"
              : "Merge Metadata"}
          </span>

          {step === -1 ? (
            <>
              <h1 className="font-bold pt-2">
                Please Provide a token ID
              </h1>
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-sm font-bold">
                  Token ID
                </a>
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
                  onClick={checkToken}
                  className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 select-none"
                >
                  Next
                </p>
              </div>
            </>
          ) : null}
          {step === 0 ? (
            <>
              {/* network */}
              <Dropdown
                network={network}
                setNetwork={setNetwork}
                step={step}
              />
              {/* nft */}
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  NFT Address
                </a>
                <input
                  type="text"
                  className="bg-gray-100 rounded-md h-10 pl-2 shadow-md"
                  onChange={(e) => {
                    setNftAddress(e.target.value);
                  }}
                  value={nftAddress}
                ></input>
              </div>
              {/* token id */}
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-md font-bold">
                  Token ID
                </a>
                {tokenId}
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
              network={network}
              setNetwork={setNetwork}
              setNftAddress={setNftAddress}
              nftAddress={nftAddress}
              swap={LockToken}
              tokenId={tokenId}
              owner={owner}
              setOwner={setOwner}
            />
          ) : null}
          {/* loading screen */}
          {step === 2 ? <Step2 /> : null}

          {/* release screen */}
          {step === 3 ? (
            <Step3
              network={network}
              setNetwork={setNetwork}
              transaction={transactionHash}
              cid={CID}
              token={tokenId}
              owner={address}
            />
          ) : null}
          {/* {/* final screen */}
          {step === 5 ? (
            <Step5
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

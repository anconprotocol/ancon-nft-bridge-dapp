// network
// nft address
// token id

import { ethers } from "ethers";
import { useState } from "react";
import Header from "../components/Header";
import GetChain from "../functions/GetChain";
import useProvider from "../hooks/useProvider";
import { XDVNFT__factory } from "../types/ethers-contracts";

// swap
function swap() {
  const provider = useProvider();
  let prov: any;
  let Network: any;
  const [step, setStep] = useState(0);
  const [nftAddress, setNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [network, setNetwork] = useState("Network");
  const [showDropdown, setShowDropdown] = useState("hidden");

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
    console.log(nftAddress, typeof tokenId, network);
  };
  const swap = async () => {
    setStep(2);
    prov = new ethers.providers.Web3Provider(provider);
    Network = await prov.getNetwork();
    const contractAddresses: any = await GetChain(Network);
    // debugger
    const contract3 = XDVNFT__factory.connect(
      contractAddresses.xdv,
      prov
    );
    console.log(typeof tokenId)
    const tokenUri = await contract3.tokenURI(1);
    console.log("token uri", tokenUri);
    let metadaUri = await fetch(
      `https://api.ancon.did.pa/v0/dagjson/${tokenUri}/`
    );
     metadaUri = await metadaUri.json()
     console.log('metada', metadaUri)
  };
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4">
          <span className="text-black font-bold text-xl">
            {step === 1 ? "Target" : "Source"}
          </span>
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
          {step === 0 ? (
            <div>
              {/* network */}
              <div className="flex-col flex mt-3">
                {/* <a className="text-gray-600 text-sm font-bold">
                  Network
                </a> */}
                <div className="dropdown inline-block relative">
                  <button
                    className="bg-primary-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center shadow-md"
                    onClick={handleDrop}
                  >
                    <span className="mr-1">{network}</span>
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />{" "}
                    </svg>
                  </button>

                  <ul
                    className={`dropdown-menu absolute text-white pt-1 ${showDropdown} transition-all duration-150`}
                  >
                    <li
                      className=""
                      onClick={() => (
                        setNetwork("bnbt"), handleDrop()
                      )}
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
                      onClick={() => (
                        setNetwork("kovan"), handleDrop()
                      )}
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
                <a className="text-gray-600 text-sm font-bold">
                  NFT Address
                </a>
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
                  onClick={next}
                  className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 select-none"
                >
                  Next
                </p>
              </div>
            </div>
          ) : null}
          {step === 1 ? (
            <div>
              {/* network */}
              <div className="flex-col flex mt-3">
                {/* <a className="text-gray-600 text-sm font-bold">
                  Network
                </a> */}
                <div className="dropdown inline-block relative">
                  <button
                    className="bg-primary-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center shadow-md"
                    onClick={handleDrop}
                  >
                    <span className="mr-1">{network}</span>
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />{" "}
                    </svg>
                  </button>

                  <ul
                    className={`dropdown-menu absolute text-white pt-1 ${showDropdown} transition-all duration-150`}
                  >
                    <li
                      className=""
                      onClick={() => (
                        setNetwork("bnbt"), handleDrop()
                      )}
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
                      onClick={() => (
                        setNetwork("kovan"), handleDrop()
                      )}
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
                <a className="text-gray-600 text-sm font-bold">
                  NFT Address
                </a>
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
                <a className="text-gray-600 text-sm font-bold">
                  Token ID
                </a>
                <p>{tokenId}</p>
              </div>
              <div>
                <p
                  onClick={swap}
                  className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 select-none"
                >
                  Swap
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default swap;

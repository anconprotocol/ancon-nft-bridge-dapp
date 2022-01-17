import { ChevronDownIcon } from "@heroicons/react/solid";
import React from "react";

interface StepProps {
  handleDrop: () => void;
  network: string;
  showDropdown: string;
  setNetwork: React.Dispatch<React.SetStateAction<string>>;
  setNftAddress: React.Dispatch<React.SetStateAction<string>>;
  nftAddress: string;
  swap: () => Promise<void>;
  tokenId: string;
  owner: string;
  setOwner: React.Dispatch<React.SetStateAction<string>>;
}
/**
 * TARGET STEP
 * @description Handles the new network, new nft address and new owner
*/
function Step1({
  handleDrop,
  network,
  showDropdown,
  setNetwork,
  setNftAddress,
  nftAddress,
  swap,
  tokenId,
  owner,
  setOwner,
}: StepProps) {
  return (
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
            <ChevronDownIcon className="w-8 text-white"/>
          </button>

          <ul
            className={`dropdown-menu absolute text-white pt-1 ${showDropdown} transition-all duration-150`}
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
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">
          Target Address
        </a>
        <input
          type="text"
          className="bg-gray-100 rounded-sm h-10 pl-2 shadow-sm"
          onChange={(e) => {
            setOwner(e.target.value);
          }}
          value={owner}
        ></input>
      </div>
      {/* token id */}
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">Token ID</a>
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
  );
}

export default Step1;

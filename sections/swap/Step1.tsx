import { ChevronDownIcon } from "@heroicons/react/solid";
import React from "react";
import Dropdown from "../../components/Dropdown";

interface StepProps {
  network: string;
  setNetwork: React.Dispatch<React.SetStateAction<string>>;
  setNftAddress: React.Dispatch<React.SetStateAction<string>>;
  nftAddress: string;
  swap: () => Promise<"error metadata" | undefined>;
  tokenId: string;
  owner: string;
  setOwner: React.Dispatch<React.SetStateAction<string>>;
}
/**
 * TARGET STEP
 * @description Handles the new network, new nft address and new owner
*/
function Step1({
  
  network,
  
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
      <Dropdown network={network} setNetwork={setNetwork}/>
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

import { ChevronDownIcon } from "@heroicons/react/solid";
import React, { useState } from "react";
declare let window: any;
interface DropdownProps {
  network: string;
  setNetwork: React.Dispatch<React.SetStateAction<string>>;
  step?: number;
}
export default function Dropdown({
  network,
  setNetwork,
  step,
}: DropdownProps) {
  const [show, setShow] = useState("hidden");

  const handleDrop = () => {
    switch (show) {
      case "hidden":
        setShow("");
        break;
      case "":
        setShow("hidden");
        break;
    }
  };
  const handleNetwork = async (network: any) => {
    //   set title
    switch (network) {
      case "bnbt":
        await setNetwork("Binance Smart Chain testnet");
        if (step === 0 || step === 3) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x61" }],
          });
        }
        break;

      case "mumbai":
        await setNetwork("Polygon Mumbai testnet");
        if (step === 0 || step === 3) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13881" }],
          });
        }
        break;
    }

    await handleDrop();
  };
  return (
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
          <ChevronDownIcon className="w-8 text-white" />
        </button>

        <ul
          className={`dropdown-menu absolute text-white pt-1 ${show} transition-all duration-150`}
        >
          <li className="" onClick={() => handleNetwork("bnbt")}>
            <a
              className="rounded-t bg-primary-600 hover:bg-primary-500 py-2 px-4 block whitespace-no-wrap transition-all duration-250 ease-out"
              href="#"
            >
              Binance Smart Chain testnet
            </a>
          </li>
          <li className="" onClick={() => handleNetwork("mumbai")}>
            <a
              className="bg-primary-600 hover:bg-primary-500  py-2 px-4 block whitespace-no-wrap rounded-b transition-all duration-250 ease-out"
              href="#"
            >
              Polygon Mumbai testnet
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

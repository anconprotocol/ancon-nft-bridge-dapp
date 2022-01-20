import React from 'react';
import Dropdown from '../../components/Dropdown';

interface StepProps {
    network: string;
    transaction: string;
    setNetwork: React.Dispatch<React.SetStateAction<string>>;
  }
function Step4({network, setNetwork, transaction}:StepProps) {
  return <div>
      <div className="flex-col flex mt-3 items-center">
        <h1 className="font-bold">
          Final step to release the token, please check the following
        </h1>
        <a className="text-gray-600 text-sm font-bold mt-4">
          Network
        </a>
       
        <p className="mb-4">
          {network === "bnbt"
            ? "Binance SC Testnet"
            : "Kovan Testnet"}
        </p>

        <a className="text-gray-600 text-sm font-bold mt-4">
          Transaction
        </a>
        <p className="mb-4">
          {transaction}
        </p>
        <Dropdown
          network={"Network"}
          setNetwork={setNetwork}
          step={3}
        />
      </div>
  </div>;
}

export default Step4;

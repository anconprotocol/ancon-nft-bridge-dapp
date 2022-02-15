import { ChevronDownIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import Dropdown from "../../components/Dropdown";
interface StepProps {
  network: string;
  transaction: string;
  setNetwork: React.Dispatch<React.SetStateAction<string>>;
  cid: string;
  token: string;
  owner: string;
}
function Step3({ network, setNetwork, transaction, cid,token, owner }: StepProps) {
  const router = useRouter();

  return (
    <div>
      <div className="flex-col flex mt-3 items-center">
        <h1 className="font-bold print:hidden">
          The token has been transfered to release it please save the
          transaction hash and url before changing the network
        </h1>
        <a className="text-gray-600 text-xl font-bold mt-4">
          Transaction Hash
        </a>
        <p className="mb-4">{transaction}</p>
        <a className="text-gray-600 text-xl font-bold mt-4 mb-2">
          click QR code to copy the link or save the QR
        </a>
        <div className="pb-2 cursor-pointer transform active:scale-105 active:text-green-900 transition-all ease-out duration-200" onClick={() => navigator.clipboard.writeText(`http://localhost:3000/release?cid=${cid}&transaction=${transaction}&network=${
              network === "Kovan Tesnet" ? "42" : "97"
            }&tokenId=${token}&oldOwner=${owner}`)}>
          <QRCode
            value={`https://mint.ancon.did.pa/release?cid=${cid}&transaction=${transaction}&network=${
              network === "Kovan Tesnet" ? "42" : "97"
            }&tokenId=${token}&oldOwner=${owner}` }
          />
        </div>
        <Dropdown
          network={"Network"}
          setNetwork={setNetwork}
          step={3}
        />
      </div>
    </div>
  );
}

export default Step3;

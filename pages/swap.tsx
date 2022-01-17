// network
// nft address
// token id

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

// swap
function swap() {
  const provider = useProvider();
  let prov: any;
  let Network: any;
  let signer: any;
  const [step, setStep] = useState(0);
  const [nftAddress, setNftAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [network, setNetwork] = useState("Network");
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
  const swap = async () => {
    setStep(2);
    prov = new ethers.providers.Web3Provider(provider);
    signer = await prov.getSigner();
    Network = await prov.getNetwork();
    const contractAddresses: any = await GetChain(Network);
    // debugger
    const contract3 = XDVNFT__factory.connect(
      contractAddresses.xdv,
      prov
    );

    const tokenUri = await contract3.tokenURI(parseInt(tokenId));

    const rawMetadaUri = await fetch(
      `https://api.ancon.did.pa/v0/dagjson/${tokenUri}/`
    );
    const metadaUri = await rawMetadaUri.json();
    const payload = [
      {
        path: "owner",
        previousValue: address,
        nextValue: owner,
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
        pin: "true",
        cid: tokenUri,
      }),
    };
    const rawPut = await fetch(
      `https://api.ancon.did.pa/v0/dag`,
      requestOptions
    );
    const put = await rawPut.json();
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
            <Step0
              handleDrop={handleDrop}
              network={network}
              showDropdown={showDropdown}
              setNetwork={setNetwork}
              setNftAddress={setNftAddress}
              nftAddress={nftAddress}
              next={next}
              tokenId={tokenId}
              setTokenId={setTokenId}
            />
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

export default swap;

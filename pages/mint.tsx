import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/solid";
import { sign } from "crypto";
import { ethers } from "ethers";
import { setHttpAgentOptions } from "next/dist/server/config";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Web3 from "web3";

import { addressState } from "../atoms/addressAtom";
import { errorState } from "../atoms/errorAtom";
import Header from "../components/Header";
import AnconProtocol from "../functions/AnconProcotolClass/AnconProtocol";
import useProvider from "../hooks/useProvider";

function Mint() {
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    owner: "",
    sources: [],
    image: "",
    root: "",
  });
  const [transaction, setTransaction] = useState("");
  const [show, setShow] = useState("able");
  const router = useRouter();
  const { address, height, cid, hexdata, user }: any = router.query;
  // console.log(router.query)
  const provider = useProvider();
  // console.log(router.query)
  const addressToCheck = useRecoilValue(addressState);
  const setErrorModal = useSetRecoilState(errorState);

  const getMetadata = async () => {
    if (address) {
      const rawData = await fetch(
        `https://tensta.did.pa/v0/dag/${cid}/contentHash`
      );
      const data = await rawData.json();

      data["root"] = await await Object?.values(data.root)[0];
      setMetadata({ ...data });
    }
  };

  useEffect(() => {
    getMetadata();
  }, [address]);

  const verify = async () => {
    // const did = await Ancon.getDidTransaction();
    try {
      const rawSignature = await fetch(
        `https://tensta.did.pa/v0/dag/${cid}/`
      );
      const { signature, ...trashData } = await rawSignature.json();

      const rawData = await fetch(
        `https://tensta.did.pa/v0/dag/${cid}/contentHash`
      );
      const data = await rawData.json();
      // struct the data in order
      const destructuredData = {
        name: data.name,
        description: data.description,
        image: data.image,
        owner: data.owner,
        sources: data.sources,
      };

      const digest = ethers.utils.arrayify(
        ethers.utils.toUtf8Bytes(JSON.stringify(destructuredData))
      );

      // verify the message

      const verify = ethers.utils.verifyMessage(digest, signature);
      if (verify == addressToCheck) {
        try {
          const rawLastHash = await fetch(
            `https://tensta.did.pa/v0/proofs/lasthash`
          );
          const lasthash = await rawLastHash.json();
          console.log(lasthash.lastHash.version, height)
          if (lasthash.lastHash.version > height) {
            setShow("owner");
          }else(
            setShow('not')
          )
        } catch (error) {
          console.log("error", error);
        }
      } else {
        setShow("not");
      }
    } catch (error) {
      setErrorModal([
        "Something went wrong please try again",
        "Try again",
        "`/qrview?address=${address}&did=${tokenData.tokenCid}&cid=${tokenData.metadaCid}`",
      ]);
    }
  };

  const mint = async () => {
    try {
      console.log('minting')
      const ancon = new AnconProtocol(
        provider,
        addressToCheck,
        Web3.utils.keccak256("tensta"),
        "tensta.did.pa/v0/"
      );
      await ancon.initialize();
      const mint = await ancon.mintNft(hexdata, user);
      console.log(mint);
      await mint?.wait(2);
      setTransaction(mint?.hash as string);
      setShow("minted");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4 w-11/12 md:w-6/12 2xl:w-5/12">
          <h1 className="font-bold text-xl pb-2">Metadata Info</h1>

          <div className="space-y-4">
            {/* owner */}
            <div>
              <h4 className="font-medium text-gray-600">owner</h4>
              <p className="truncate">{metadata.owner}</p>
            </div>
            {/* name */}
            <div>
              <h4 className="font-medium text-gray-600">Name</h4>
              <p>{metadata.name}</p>
            </div>

            {/* description */}
            <div>
              <h4 className="font-medium text-gray-600">
                Description
              </h4>
              <p>{metadata.description}</p>
            </div>

            {/* Image */}
            <div>
              <h4 className="font-medium text-gray-600">Image</h4>

              <p className="truncate">{metadata.image}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src={`https://tensta.did.pa/v0/file/${metadata.image}/`}
              alt="nft-image"
              className="rounded w-3/5"
            />
          </div>
          {show === "minted" && (
            <div>
              {/* transaction hash */}
              <div>
                <h4 className="font-medium text-gray-600">
                  Transaction Hash
                </h4>
                <p>{metadata.description}</p>
              </div>
            </div>
          )}

          {/* icon */}
          {show === "owner" && (
            <div className="grid mt-4 grid-cols-1 place-items-center">
              <BadgeCheckIcon className="w-10 text-green-700" />
              <p className="text-green-700">
                The token is ready to be minted.
              </p>
            </div>
          )}
          {show === "owner" && (
            <div className="flex items-center justify-center mt-3 space-x-3">
              <button
                onClick={mint}
                className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
              >
                Mint
              </button>
            </div>
          )}

          {show === "not" && (
            <div className="grid mt-4 grid-cols-1 place-items-center">
              <XCircleIcon className="w-10 text-red-700" />
              <p className="text-red-700">
                Token cannot be minted yet
              </p>
            </div>
          )}

          {/* button */}
          {(show === "able" || show === 'not') && (
            <div className="flex items-center justify-center mt-3 space-x-3">
              <button
                onClick={verify}
                className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
              >
                Verify Signature
              </button>
            </div>
          )}
        
        </div>
      </div>
    </main>
  );
}

export default Mint;

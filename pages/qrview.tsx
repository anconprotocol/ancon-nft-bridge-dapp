import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/solid";
import { sign } from "crypto";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { addressState } from "../atoms/addressAtom";
import { errorState } from "../atoms/errorAtom";
import Header from "../components/Header";
import AnconProtocol, {
  sleep,
} from "../functions/AnconProcotolClass/AnconProtocol";
import useProvider from "../hooks/useProvider";

function Qrview() {
  let Ancon: AnconProtocol;
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    owner: "",
    sources: [],
    image: "",
    root: "",
  });
  const [show, setShow] = useState("");
  const router = useRouter();
  const provider = useProvider();
  const { address, did, cid }: any = router.query;
  const addressToCheck = useRecoilValue(addressState);
  const setErrorModal = useSetRecoilState(errorState);
  if (address) {
    Ancon = new AnconProtocol(provider, address);
    Ancon.initialize();
  }

  const getMetadata = async () => {
    if (address) {
      const data = await Ancon.getMetadata(did, address);
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
        `https://api.ancon.did.pa/v0/dag/${cid}/`
      );
      const { signature, ...trashData } = await rawSignature.json();

      const rawData = await fetch(
        `https://api.ancon.did.pa/v0/dag/${did}/?namespace=anconprotocol/users/${address}`
      );
      const data = await rawData.json();

      console.log(data, trashData);
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
      console.log(digest, signature);
      const verify = ethers.utils.verifyMessage(digest, signature);
      if (verify == addressToCheck) {
        setShow("owner");
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

  const verifyBlockchain = async() => {
    
  }
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

          {/* icon */}
          {show === "owner" && (
            <div className="grid mt-4 grid-cols-1 place-items-center">
              <BadgeCheckIcon className="w-10 text-green-700" />
              <p className="text-green-700">
                Signature verified succesfully
              </p>
            </div>
          )}
          {show === "not" && (
            <div className="grid mt-4 grid-cols-1 place-items-center">
              <XCircleIcon className="w-10 text-red-700" />
              <p className="text-red-700">
              Signature could not be verified 
              </p>
            </div>
          )}
          {/* button */}
          <div className="flex items-center justify-center mt-3 space-x-3">
            <button
              onClick={verify}
              className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
            >
              Verify Signature
            </button>
            <button
              onClick={verify}
              className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
            >
              Verify blockchain existence
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Qrview;
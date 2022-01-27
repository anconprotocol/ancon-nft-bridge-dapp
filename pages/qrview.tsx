import { BadgeCheckIcon } from "@heroicons/react/solid";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { sign } from "node:crypto";
import { copyFileSync } from "node:fs";
import { json } from "node:stream/consumers";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AnconProtocol from "../functions/AnconProcotolClass/AnconProtocol";
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
  const [show, setShow] = useState(false);
  const router = useRouter();
  const provider = useProvider();
  const { address, did, cid }: any = router.query;

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
    const rawSignature = await fetch(
      `https://api.ancon.did.pa/v0/dag/${cid}/`
    );
    const { signature, ...trashData } = await rawSignature.json();

    const rawData = await fetch(
      `https://api.ancon.did.pa/v0/dag/${did}/?namespace=anconprotocol/users/${address}`
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
    if (verify === address) {
      setShow(true);
    }
  };
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4 w-11/12 md:w-6/12 2xl:w-5/12">
          <h1 className="font-bold text-xl pb-2">Metada Info</h1>

          <div className="space-y-4">
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

            {/* owner */}
            <div>
              <h4 className="font-medium text-gray-600">owner</h4>
              <p className="truncate">{metadata.owner}</p>
            </div>

            {/* root */}
            <div>
              <h4 className="font-medium text-gray-600">root</h4>
              <p className="truncate">{metadata.root}</p>
            </div>
          </div>

          {/* icon */}
          {show && (
            <div className="grid mt-4 grid-cols-1 place-items-center">
              <BadgeCheckIcon className="w-10 text-green-700" />
              <p className="text-green-700">
                You are this Metadata Owner
              </p>
            </div>
          )}
          {/* button */}
          <div className="flex items-center justify-center mt-3">
            <button
              onClick={verify}
              className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 w-1/4"
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Qrview;

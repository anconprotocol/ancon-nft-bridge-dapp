import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/solid";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Web3 from "web3";
import { addressState } from "../atoms/addressAtom";
import { errorState } from "../atoms/errorAtom";
import Header from "../components/Header";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";

function Qrview() {
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

  const { address, did, cid }: any = router.query;
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

  const toAbiProof = async (proof: any) => {
    console.log(proof)
    proof.key = ethers.utils.hexlify(
      ethers.utils.base64.decode(proof.key)
    );

    proof.value = ethers.utils.hexlify(
      ethers.utils.base64.decode(proof.value)
    );

    proof.leaf.prefix = ethers.utils.hexlify(
      ethers.utils.base64.decode(proof.leaf.prefix)
    );
    proof.leaf.hash = 1;
    proof.path = proof.path.map((x: any) => {
      let suffix;
      if (!!x.suffix) {
        suffix = ethers.utils.hexlify(
          ethers.utils.base64.decode(x.suffix)
        );
        return {
          valid: true,
          prefix: ethers.utils.hexlify(
            ethers.utils.base64.decode(x.prefix)
          ),
          suffix: suffix,
          hash: 1,
        };
      } else {
        return {
          valid: true,
          prefix: ethers.utils.hexlify(
            ethers.utils.base64.decode(x.prefix)
          ),
          hash: 1,
          suffix: "0x",
        };
      }
    });
    proof.leaf.prehash_key = 0;
    proof.leaf.len = proof.leaf.length;
    proof.valid = true;
    proof.leaf.valid = true;

    return proof;
  };

  const verifyBlockchain = async () => {
    try {
      
    
    const rawResponse = await fetch(
      `https://tensta.did.pa/v0/dag/${cid}/`
    );
    const response = await rawResponse.json();
    // get the last hash
    const rawLastHash = await fetch(
      `https://tensta.did.pa/v0/proofs/lasthash`
    );
    const lasthash = await rawLastHash.json();
    const version = lasthash.lastHash.version;

    const rawProof = await fetch(
      `https://tensta.did.pa/v0/proof/${response.key}?height=${response.height}`
    );

    const proof = await rawProof.json();
    const abiedProof = await toAbiProof(proof[0].Proof.exist);
    const prov = new ethers.providers.JsonRpcProvider(
      "https://data-seed-prebsc-1-s1.binance.org:8545/"
    );
    // verify proof
    const anconReader = AnconProtocol__factory.connect(
      process.env.NEXT_PUBLIC_ANCON_bnbt as string,
      prov
    );
    const verify = await anconReader.verifyProofWithKV(
      Web3.utils.keccak256('anconprotocol'),
      abiedProof.key,
      abiedProof.value,
      abiedProof
    )
    console.log('verify', verify)
  } catch (error) {
      console.log('coudnt verify', error)
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
              <p className="truncate">{`https://tensta.did.pa/v0/file/${metadata.image}/`}</p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={`https://tensta.did.pa/v0/file/${metadata.image}/`}
                alt="nft-image"
                className="rounded w-3/5"
              />
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
              onClick={verifyBlockchain}
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

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { Web3Storage } from "web3.storage";
import Header from "../components/Header";
import AnconProtocol from "../functions/AnconProcotolClass/AnconProtocol";
import useProvider from "../hooks/useProvider";

function NftView() {
  let Ancon: AnconProtocol;
  const router = useRouter();
  const provider = useProvider();
  const { address, did, cid }: any = router.query;
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    owner: "",
    sources: [],
    image: "",
    root: "",
    uri:""
  });

  //   initialize Ancon
  if (address) {
    Ancon = new AnconProtocol(provider, address);
    Ancon.initialize();
  }

  /**
   * Return an IPFS gateway URL for the given CID and path
   * @param {string} cid
   * @param {string} path
   * @returns {string}
   */
  function makeGatewayURL(cid: string, path: string) {
    return `https://${cid}.ipfs.dweb.link/${encodeURIComponent(
      path
    )}`;
  }
  // retrieve the ipfs access token
  const getAccessToken = () => {
    const apikey: any = process.env.NEXT_PUBLIC_API_KEY_STORAGE;
    return apikey;
  };

  const getMetadata = async () => {
    if (address) {
      const data = await Ancon.getMetadata(did, address);
      const storage = new Web3Storage({
        token: getAccessToken(),
      });
      const image = await storage.get(data.image);
      const url = await makeGatewayURL(data.image, "metadata.json");
      const res = await fetch(url);
      let uri:string;
      try {
        if (!res.ok) {
          throw new Error(
            `error fetching image metadata: [${res.status}] ${res.statusText}`
          );
        }
        const metadata = await res.json();
        const gatewayURL = makeGatewayURL(cid, metadata.path);
        uri = `ipfs://${cid}/${metadata.path}`;
        console.log(uri)
        setMetadata({...metadata, uri})
      } catch (error) {
        console.log("error", error);
      }

      console.log("image", await image?.files);
      setMetadata({ ...data});
    }
  };
  useEffect(() => {
    getMetadata();
  }, [address]);
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

          {/* button */}
          <div className="flex items-center justify-center mt-3">
            <button className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 w-1/4">
              Verify
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default NftView;

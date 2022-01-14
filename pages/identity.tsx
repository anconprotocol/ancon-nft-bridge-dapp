import Image from "next/image";
import { useState } from "react";
import Header from "../components/Header";
import GoogleLogin from "react-google-login";
import * as securePin from "secure-pin";
import QRCode from "react-qr-code";
import { ethers, Signer } from "ethers";
import useProvider from "../hooks/useProvider";
import { encrypt } from "eciesjs";
import { base64 } from "ethers/lib/utils";

declare let document: any;
function identity() {
  const [step, setStep] = useState(0);
  const [identityData, setIdentityData] = useState({
    address: "",
    name: "",
    lastName: "",
    email: "",
  });
  const [localImage, setLocalImage] = useState<any | null>(null);
  const [image, setImage] = useState<any | null>(null);
  const [error, setError] = useState(false);
  const provider = useProvider();
  // handles the change of the image
  const onImageChange = (
    event: React.ChangeEvent<HTMLInputElement> | any
  ) => {
    setImage(event.target.files[0]);
    setError(false);
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();

      reader.onload = (e: any) =>
        setLocalImage(e?.target?.result?.split(",")[1]);
      reader.readAsDataURL(event.target.files[0]);
    }
  };
  const clickInput = () => document.getElementById("nft-img").click();
  const responseGoogle = (response: any) => {
    setIdentityData({
      ...identityData,
      name: response.profileObj.givenName,
      email: response.profileObj.email,
      lastName: response.profileObj.familyName,
    });
  };

  const createDid = async () => {
    const wallet = ethers.Wallet.createRandom();
    const pubKey = wallet.publicKey;
    const walletAddress = wallet.address;
    console.log("pub", pubKey);
    // const sign = wallet.signMessage(
    //   ethers.utils.hashMessage(
    //     ethers.utils.keccak256(
    //       ethers.utils.arrayify(
    //         "signin this message to verify my public key"
    //       )
    //     )
    //   )
    // );
    // // name, lastname, email, cedula, oauth provsider
    // const payload = {
    //   domainName: walletAddress.substring(2),
    //   pub: ethers.utils.base58.encode(pubKey),
    //   signature: sign,
    //   message: "signin this message to verify my public key",
    // };

    // const requestOptions = {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // };
    // const rawdata = await fetch(
    //   "https://api.ancon.did.pa/v0/did/web",
    //   requestOptions
    // );
    // const data = await rawdata.json();
    // console.log("did web", data);
    const prov = new ethers.providers.Web3Provider(provider);
    const signer = prov.getSigner();
    let Data: any;
    let content: any;
    if (image instanceof File) {
    content = Buffer.from((await image.arrayBuffer()));
    } else {
        throw new Error('addSignedObject: must be a file object');
    }
    console.log(content)
    Data = {
      name: identityData.name,
      lastName: identityData.lastName,
      email: identityData.email,
      image: content.toString("base64"),
    };
    Data = encrypt(pubKey, Data);
    const s = await signer.signMessage(
      ethers.utils.arrayify(
        ethers.utils.toUtf8Bytes(JSON.stringify(Data))
      )
    );

    const rawDagPost = await fetch(
      "https://api.ancon.did.pa/v0/dagson/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "/",
          from: walletAddress,
          signature: s,
          data: Data,
          encrypt: true,
          authorizeRecipients: walletAddress,
        }),
      }
    );
    const DagPost = await rawDagPost.json();
    console.log("dagPost", DagPost);
    const id = await DagPost.cid;

    const generatePin = securePin.generatePin(6, (pin) => {
      return pin;
    });
    console.log("pin", generatePin);
    // cid,pin
  };
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        <div className="bg-white shadow-xl rounded-lg px-3 py-4">
          <span className="text-black font-bold text-xl">
            {step === 6 ? "NFT Created" : "Identity"}
          </span>
          {step === 0 ? (
            <div>
              {/* Oauth  */}
              {identityData.name === "" ? (
                <div className="w-full flex items-center justify-center py-3 select-none">
                  <GoogleLogin
                    scope="profile email"
                    clientId="779014570531-bvmnb5bq69uov2cc1vkr4jhh03pgdrvj.apps.googleusercontent.com"
                    render={(renderProps) => (
                      <div
                        onClick={renderProps.onClick}
                        className="relative w-10 h-10 cursor-pointer active:scale-105 transfrom transition-all"
                      >
                        <Image
                          src={"/google-icon.png"}
                          alt="google-icon"
                          layout="fill"
                          className="hover:shadow-xl"
                        />
                      </div>
                    )}
                    buttonText="Login"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    cookiePolicy={"single_host_origin"}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="my-2 font-medium">
                    {identityData.name} {identityData.lastName}
                  </h2>
                  <h2 className="font-medium">
                    {identityData.email}
                  </h2>
                </div>
              )}
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-sm font-bold">
                  Pin de Validacion
                </a>
                <input
                  type="text"
                  className="bg-gray-100 rounded-sm h-10 pl-2"
                  onChange={(e) => {
                    setIdentityData({
                      ...identityData,
                      address: e.target.value,
                    });
                  }}
                  value={identityData.address}
                ></input>
              </div>
              <div
                onClick={clickInput}
                className="p-3 rounded-lg border-2 bg-gray-50 shadow-sm cursor-pointer hover:tracking-wider transition-all duration-200 hover:border-primary-500 hover:drop-shadow-lg hover:shadow-primary-500 ease-out mt-3"
              >
                <p className="flex justify-center items-center">
                  Foto de Cedula
                </p>
              </div>
              {localImage != null ? (
                <div className="flex items-center justify-center pt-3">
                  <img
                    className="border-2 p-2 rounded-lg border-primary-500 drop-shadow-xl shadow-primary-500"
                    src={`data:image/jpeg;base64,${localImage}`}
                    style={{ maxWidth: "100px" }}
                    alt="local"
                  />
                </div>
              ) : null}
              <input
                type="file"
                onChange={onImageChange}
                className="filetype"
                id="nft-img"
                style={{ display: "none" }}
              ></input>
              <div>
                <p
                  onClick={createDid}
                  className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
                >
                  Crear
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default identity;

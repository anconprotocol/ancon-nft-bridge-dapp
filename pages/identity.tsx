/* eslint-disable react-hooks/rules-of-hooks */
import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import GoogleLogin from "react-google-login";
import * as securePin from "secure-pin";
import QRCode from "react-qr-code";
import { ethers, Signer } from "ethers";
import useProvider from "../hooks/useProvider";
import { encrypt } from "eciesjs";
import { base64, sha256, toUtf8Bytes, toUtf8String } from "ethers/lib/utils";
import { RWebShare } from "react-web-share";
import { useRouter } from "next/router";

declare let document: any;
function identity() {
  useEffect(() => {
    isDesencryptionScreen();
  }, []);

  const [step, setStep] = useState(0);
  const [identityData, setIdentityData] = useState({
    fullname: "",
  });
  const [localImage, setLocalImage] = useState<any | null>(null);
  const [qrcode, setQRCode] = useState<any | null>(null);
  const [image, setImage] = useState<any | null>(null);
  const [error, setError] = useState(false);
  const provider = useProvider();
  const [displayPin, setDisplayPin] = useState<string | null>(null);
  const router = useRouter();
  const [credentialsResponse, setCredentialsResponse] = useState<any | null>(
    null
  );
  const [inputPin, setInputPin] = useState<any | null>(null);
  let validationRequest: any;
  const [screenType, setScreenType] = useState<any | null>(null);

  // handles the change of the image
  const onImageChange = (event: React.ChangeEvent<HTMLInputElement> | any) => {
    setImage(event.target.files[0]);
    setError(false);
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();

      reader.onload = (e: any) =>
        setLocalImage(e?.target?.result?.split(",")[1]);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const unlockEncryption = async () => {
    try {
      debugger;
      const response = await fetch(
        "https://api.ancon.did.pa/v0/file/" + validationRequest.creds + "/"
      );
      debugger;
      setCredentialsResponse(response);
      // ethers.Wallet.fromEncryptedJson(response);
      debugger;
      const wallet = ethers.Wallet.fromEncryptedJson(
        credentialsResponse,
        inputPin
      );
    } catch (error) {
      console.log(error);
    }
  };

  const clickInput = () => document.getElementById("nft-img").click();
  const areFieldsEmpty = () => {
    if (identityData.fullname != "" && localImage !== null) {
      return false;
    }
    return true;
  };
  const isDesencryptionScreen = () => {
    try {
      if (router.asPath.split("?code=").length == 2) {
        setScreenType(2);
        const code = router.asPath.split("?code=");
        const decoded = ethers.utils.base64.decode(code[1]);
        validationRequest = JSON.parse(ethers.utils.toUtf8String(decoded));
        debugger;
      } else {
        setScreenType(1);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const createDid = async () => {
    const wallet = ethers.Wallet.createRandom();
    const pubKey = wallet.publicKey;
    console.log("pub", pubKey);
    const prov = new ethers.providers.Web3Provider(provider);
    const signer = prov.getSigner();
    let payload: any;
    const walletAddress = await signer.getAddress();
    let content = Buffer.from(await image.arrayBuffer());

    let encData = encrypt(pubKey, content);
    const formData = new FormData();

    const f = new File([new Blob([Uint8Array.from(encData)])], image.name);
    formData.append("file", f);
    const upload = await fetch("https://api.ancon.did.pa/v0/file", {
      method: "POST",
      body: formData,
    });
    const res = await upload.json();
    payload = {
      fullname: identityData.fullname,
      image: res.cid,
    };

    const s = await signer.signMessage(
      ethers.utils.arrayify(ethers.utils.toUtf8Bytes(JSON.stringify(payload)))
    );

    // const did = await fetch(
    //   `http://localhost:7788/v0/did/${walletAddress.replace('0x','raw:0x')}`
    // )

    const rawDagPost = await fetch("https://api.ancon.did.pa/v0/dagjson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "/",
        from: walletAddress,
        signature: s,
        data: payload,
      }),
    });
    const contentBlock = await rawDagPost.json();

    securePin.generatePin(6, async (pin) => {
      const creds = await wallet.encrypt(pin.toString());
      const s = await signer.signMessage(
        ethers.utils.arrayify(ethers.utils.toUtf8Bytes(creds))
      );

      const rawDagPost = await fetch("https://api.ancon.did.pa/v0/dagjson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "/",
          from: walletAddress,
          signature: s,
          data: JSON.parse(creds),
        }),
      });

      const resp = await rawDagPost.json();

      setQRCode(
        ethers.utils.base64.encode(
          toUtf8Bytes(
            JSON.stringify({
              creds: resp.cid,
              content: contentBlock.cid,
            })
          )
        )
      );
      debugger;
      setDisplayPin(pin);
      return pin;
    });
    // cid,pin
  };
  return (
    <main className="bg-gray-50 relative h-screen w-full mb-4">
      <Header />
      <div className="flex justify-center items-center md:mt-18 2xl:mt-24 mt-8 w-full">
        {screenType == 1 ? (
          <div className="bg-white shadow-xl rounded-lg px-3 py-4">
            <span className="text-black font-bold text-xl">
              {step === 6
                ? "NFT Created"
                : "Solicitud de Verificación de identidad"}
            </span>
            {step === 0 ? (
              <div>
                <div className="flex-col flex mt-3">
                  <a className="text-gray-600 text-sm font-bold">
                    Nombre completo
                  </a>
                  <input
                    type="text"
                    className="bg-gray-100 rounded-sm h-10 pl-2"
                    onChange={(e) => {
                      setIdentityData({
                        ...identityData,
                        fullname: e.target.value,
                      });
                    }}
                    value={identityData.fullname}
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
                {!areFieldsEmpty() ? (
                  <div>
                    <p
                      onClick={createDid}
                      className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
                    >
                      Crear
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
            {qrcode != null && displayPin != null ? (
              <div>
                <div className="flex items-center justify-center pt-3">
                  <QRCode value={qrcode} />
                </div>
                <div className="flex items-center justify-center pt-3">
                  <a className="text-gray-600 text-sm font-bold">{`Pin: ${displayPin}`}</a>
                </div>
              </div>
            ) : null}
            {!areFieldsEmpty() && qrcode != null ? (
              <div>
                <RWebShare
                  data={{
                    text: "AnconProtocol Did Panama, identity verification request",
                    url: `${location.href}?code=${qrcode}`,
                    title: "Identity verification request",
                  }}
                  onClick={() => console.log("shared successfully!")}
                >
                  <p className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4">
                    Compartir
                  </p>
                </RWebShare>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-lg px-3 py-4">
            <span className="text-black font-bold text-xl">
              Desbloquear con pin
            </span>
            <div>
              <div className="flex-col flex mt-3">
                <a className="text-gray-600 text-sm font-bold">
                  Ingrese Pin para validar identidad
                </a>
                <input
                  type="text"
                  className="bg-gray-100 rounded-sm h-10 pl-2"
                  onChange={(e) => {
                    setInputPin(e.target.value);
                  }}
                  value={inputPin}
                ></input>
              </div>

              {inputPin ? (
                <div>
                  <p
                    onClick={() => {
                      unlockEncryption();
                    }}
                    className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
                  >
                    Confirmar
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default identity;

import { ethers } from "ethers";
import { useRecoilValue, useRecoilState } from "recoil";
import Web3 from "web3";
import { errorState } from "../atoms/errorAtom";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";

async function EnrollL2Account(
  cid: string,
  z: any,
  setStep: React.Dispatch<React.SetStateAction<number>>,
  provider: any,
  setErrorModal: React.Dispatch<React.SetStateAction<[string]>>
) {
  // const [errorModal, setErrorModal] = useRecoilState(errorState);
  console.log("enrolling to L2");
  try {
    const prov = new ethers.providers.Web3Provider(provider);
    const signer = prov.getSigner();

    const contract1 = AnconProtocol__factory.connect(
      "0x3AD9090a3E3af4e288805d8c020F4CCd20212036",
      prov
    );
    const contract2 = AnconProtocol__factory.connect(
      "0x3AD9090a3E3af4e288805d8c020F4CCd20212036",
      signer
    );
    const UTF8_cid = ethers.utils.toUtf8Bytes(cid);
    console.log("utf8 ===>", UTF8_cid);
    const getProof = await contract1.getProof(UTF8_cid);
    console.log("getProof", getProof);
    if (getProof !== "0x") {
      return "proof already exist";
    }

    console.log(
      "proof key",
      Web3.utils.hexToString(z.key),
      Web3.utils.hexToString(z.value)
    );
    const rawLastHash = await fetch(
      "https://api.ancon.did.pa/v0/proofs/lasthash"
    );
    const lasthash = await rawLastHash.json();
    const relayHash = await contract1.getProtocolHeader();
    console.log(
      "last hash",
      ethers.utils.hexlify(
        ethers.utils.base64.decode(lasthash.lastHash.hash)
      )
    );
    console.log("relay hash", relayHash);

    const enroll = await contract2.enrollL2Account(
      z.key,
      UTF8_cid,
      z
    );
    setStep(1);
    console.log("enroll==>", enroll);
  } catch (error) {
    setStep(0);
    setErrorModal([
      "we could not procces your transaction please try again",
    ]);
    console.log("error", error);
  }
}

export default EnrollL2Account;

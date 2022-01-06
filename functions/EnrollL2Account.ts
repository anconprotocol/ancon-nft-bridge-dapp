import { ethers } from "ethers";
import { useRecoilValue, useRecoilState } from "recoil";
import Web3 from "web3";
import { errorState } from "../atoms/errorAtom";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";
const AnconToken = require("../contracts/ANCON.sol/ANCON.json");
async function EnrollL2Account(
  cid: string,
  z: any,
  setStep: React.Dispatch<React.SetStateAction<number>>,
  provider: any,
  setErrorModal: React.Dispatch<React.SetStateAction<string[]>>,
  address:string
) {
  // const [errorModal, setErrorModal] = useRecoilState(errorState);
  console.log("enrolling to L2");
  try {
    const prov = new ethers.providers.Web3Provider(provider);
    const signer = prov.getSigner();

    const contract1 = AnconProtocol__factory.connect(
      "0xA7a01C71269Abafdc8166cc9E0DEBa27EcAB283A",
      prov
    );
    const contract2 = AnconProtocol__factory.connect(
      "0xA7a01C71269Abafdc8166cc9E0DEBa27EcAB283A",
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

    // const checkPolling = async () => {
    //   console.log('polling')
    //   const header = await contract1.getProtocolHeader();
    //   if (header === lasthash) {
    //     return true;
    //   }
    //   return undefined;
    // };
    // console.log('starting to poll')
    // const poll = await ethers.utils.poll(checkPolling);
    // console.log('poll ==>', poll)
    const provi= new Web3(provider) 
    provi.eth.defaultAccount = address;
    const dai = new provi.eth.Contract(
      AnconToken.abi,
      "0xec5dcb5dbf4b114c9d0f65bccab49ec54f6a0867"
    );
    const allowance = await dai.methods.allowance(address, contract2.address).call()
    if(allowance == 0){
      await dai.methods.approve(contract2.address, '1000').send({
        gasPrice: "22000000000",
        gas: 400000,
        from: address
      })
    }
    console.log()
    const enroll = await contract2.enrollL2Account(
      z.key,
      UTF8_cid,
      z
    );
    setStep(3);
    console.log("enroll==>", enroll);
  } catch (error) {
    setStep(0);
    setErrorModal([
      "We could not procces your transaction please try again",
      "Try again",
      "/enroll",
      "Create NFT",
      "/create",
    ]);
    console.log("error", error);
  }
}

export default EnrollL2Account;

import { ethers } from "ethers";
import { useRecoilValue, useRecoilState } from "recoil";
import Web3 from "web3";
import { errorState } from "../atoms/errorAtom";
import { sleep } from "../pages/create";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";
import GetDid from "./GetDid";
const AnconToken = require("../contracts/ANCON.sol/ANCON.json");
async function EnrollL2Account(
  cid: string,
  z: any,
  setStep: React.Dispatch<React.SetStateAction<number>>,
  provider: any,
  setErrorModal: React.Dispatch<React.SetStateAction<string[]>>,
  address: string
) {
  // const [errorModal, setErrorModal] = useRecoilState(errorState);
  console.log("enrolling to L2");
  try {
    const prov = new ethers.providers.Web3Provider(provider);
    const signer = await prov.getSigner();
    const network = await prov.getNetwork();

    const getAddress = async () => {
      let contractAddress: any;
      let daiAddress: any;
      switch (network.chainId) {
        case 97:
          contractAddress = process.env.NEXT_PUBLIC_ANCON_bnbt;
          daiAddress = process.env.NEXT_PUBLIC_DAI_bnbt;
          break;
        case 56:
          contractAddress = process.env.NEXT_PUBLIC_ANCON_bnbt;
          break;
        case 42:
          contractAddress = process.env.NEXT_PUBLIC_ANCON_kovan;
          daiAddress = process.env.NEXT_PUBLIC_DAI_kovan;
          break;
      }
      return [contractAddress, daiAddress];
    };
    const contractAddress: any = await getAddress();
    console.log("asdd", contractAddress);
    const contract1 = AnconProtocol__factory.connect(
      contractAddress[0],
      prov
    );
    const contract2 = AnconProtocol__factory.connect(
      contractAddress[0],
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
    const version = lasthash.lastHash.version;

    const provi = new Web3(provider);
    provi.eth.defaultAccount = address;
    const dai = new provi.eth.Contract(
      AnconToken.abi,
      contractAddress[1]
    );

    const getHeight = async () => {
      const did = await GetDid(address);
      return did.height;
    };
    let height = await getHeight();
    const hash = ethers.utils.hexlify(
      ethers.utils.base64.decode(lasthash.lastHash.hash)
    );
    const filter = contract1.filters.HeaderUpdated();
    const from = await prov.getBlockNumber();
    let result = await contract1.queryFilter(filter, from);
    console.log("hash", hash);
    console.log("relay", relayHash);
    console.log("equal", hash === relayHash);
    console.log(typeof hash, typeof relayHash);
    let time = Date.now();
    const maxTime = Date.now() + 180000;
    if (hash !== relayHash) {
      console.log("hashes differ", height, version);
      while (time < maxTime) {
        result = await contract1.queryFilter(filter, from);
        console.log(result);
        if (result.length > 0) {
          break;
        }
        time = Date.now();
        await sleep(10000);
      }
    }

    const allowance = await dai.methods
      .allowance(address, contract2.address)
      .call();
    if (allowance == 0) {
      await dai.methods
        .approve(contract2.address, "1000000000000000000000")
        .send({
          gasPrice: "22000000000",
          gas: 400000,
          from: address,
        });
    }
    console.log(
      ethers.utils.keccak256(z.key) == ethers.utils.keccak256(z.key)
    );
    console.log(
      ethers.utils.keccak256(z.key) == ethers.utils.keccak256(z.key)
    );
    let enroll;
    switch (network.chainId) {
      case 97:
        enroll = await contract2.enrollL2Account(z.key, UTF8_cid, z, {
          gasPrice: "22000000000",
          gasLimit: 400000,
        });
        break;
      case 42:
        enroll = await contract2.enrollL2Account(z.key, UTF8_cid, z, {
          gasPrice: "22000000000",
          gasLimit: 400000,
        });
        break;
    }
    // enroll = await contract2.enrollL2Account(z.key, UTF8_cid, z, {
    //   gasPrice: "22000000000",
    //   gasLimit: 400000,
    // });
    const enrolled = await contract1.verifyProofWithKV(
      z.key,
      z.value,
      z
    );
    // const waitFortransaction = await prov.waitForTransaction(
    //   enroll
    // );
    setStep(3);
    console.log("enroll==>", enroll, enrolled);
    // console.log("waiting", waitFortransaction);
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

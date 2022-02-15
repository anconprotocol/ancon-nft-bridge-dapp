import { ethers } from "ethers";
import Web3 from "web3";
import { sleep } from "../pages/create";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";
import GetChain from "./GetChain";
import GetDid from "./GetDid";
const AnconToken = require("../contracts/ANCON.sol/ANCON.json");

/**
 * gets the addresses from env variables
 * @param {string} cid the network object provided from getNetwork()
 * @param z the value returned from toAbiProof()
 * @param setStep step setter to jump to next step
 * @param prov provider instiated in enroll page
 * @param signer signer instiated in enroll page
 *  @param setErrorModal web3 provider
 * @param address user Address
 * @param provider web3 provider
 * @param network network instiated in enroll page
 */
async function EnrollL2Account(
  cid: string,
  z: any,
  setStep: React.Dispatch<React.SetStateAction<number>>,
  prov: ethers.providers.Web3Provider,
  signer: ethers.providers.JsonRpcSigner,
  setErrorModal: React.Dispatch<React.SetStateAction<string[]>>,
  address: string,
  provider: any,
  network: ethers.providers.Network
) {

  try {
    const contractAddress: any = await GetChain(network);
    console.log(contractAddress);
    const contract1 = AnconProtocol__factory.connect(
      contractAddress.ancon,
      prov
    );
    console.log(prov);
    const contract2 = AnconProtocol__factory.connect(
      contractAddress.ancon,
      signer
    );
    // encoded to utf8
    const UTF8_cid = ethers.utils.toUtf8Bytes(cid);

    // get proof
    const getProof = await contract1.getProof(UTF8_cid);

    console.log(getProof);
    if (getProof !== "0x") {
      return "proof already exist";
    }

    // check the hashes
    const rawLastHash = await fetch(
      "https://tensta.did.pa/v0/proofs/lasthash"
    );
    const lasthash = await rawLastHash.json();

    const version = lasthash.lastHash.version;

    // make a Web3 prov to call the dai contract
    const provi = new Web3(provider);
    console.log(provi);
    provi.eth.defaultAccount = address;
    const dai = new provi.eth.Contract(
      AnconToken.abi,
      contractAddress.dai
    );
    console.log(dai);
    const relayHash = await contract1.getProtocolHeader(
      provi.utils.keccak256("anconprotocol")
    );
    let height = await GetDid(network.name,address);
    height = height.height;
    const hash = ethers.utils.hexlify(
      ethers.utils.base64.decode(lasthash.lastHash.hash)
    );

    // wait for the header to be updated
    const filter = contract1.filters.HeaderUpdated(
      provi.utils.keccak256("anconprotocol")
    );
    const from = await prov.getBlockNumber();
    let result = await contract1.queryFilter(filter, from);

    console.log("equal", hash === relayHash);

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

    // check the allowance
    const allowance = await dai.methods
      .allowance(address, contract2.address)
      .call();

    // enroll based on the network
    let enroll;
    switch (network.chainId) {
      case 97:
        if (allowance == 0) {
          // await dai.methods
          //   .approve(contract2.address, "1000000000000000000000")
          //   .send({
          //     gasPrice: "22000000000",
          //     gas: 400000,
          //     from: address,
          //   });
        }
        enroll = await contract2.enrollL2Account(
          provi.utils.keccak256("anconprotocol"),
          z.key,
          UTF8_cid,
          z,
          {
            gasPrice: "22000000000",
            gasLimit: 400000,
          }
        );
        break;
      case 42:
        // if (allowance == 0) {
        // await dai.methods
        //   .approve(contract2.address, "1000000000000000000000")
        //   .send({
        //     gasPrice: "400000000000",
        //     gas: 700000,
        //   });
        // }
        enroll = await contract2.enrollL2Account(
          provi.utils.keccak256("anconprotocol"),
          z.key,
          UTF8_cid,
          z,
          {
            gasPrice: "400000000000",
            gasLimit: 900000,
          }
        );
        break;
      case 80001:
        // if (allowance == 0) {
          // console.log('o800')
          // await dai.methods
          //   .approve(contract2.address, "1000000000000000000000")
          //   .send({
          //     gasPrice: "22000000000",
          //     gas: 400000,
          //     from: address,
          //   });
        // }
        enroll = await contract2.enrollL2Account(
          provi.utils.keccak256("anconprotocol"),
          z.key,
          UTF8_cid,
          z,
          {
            gasPrice: "22000000000",
            gasLimit: 400000,
          }
        );
        break;
    }

    setStep(2);
    console.log("enroll==>", enroll);
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

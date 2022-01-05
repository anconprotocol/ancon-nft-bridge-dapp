import { ethers } from "ethers";
import { useRecoilState } from "recoil";
import { errorState } from "../atoms/errorAtom";
declare let window: any;
// get transaction
const getTransaction = async (
  setStep: React.Dispatch<React.SetStateAction<number>>,
  address: string,
  setErrorModal: React.Dispatch<React.SetStateAction<string[]>>,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  provider: any
) => {
  // const [errorModal, setErrorModal] = useRecoilState(errorState);
  console.log("getting transaction from address", address);

  const prov = new ethers.providers.Web3Provider(provider);
  const network = await prov.getNetwork();
  console.log(network);
  try {
    let rawList;
    switch (network.chainId) {
      case 97:
        rawList = await fetch(
          `https://api-testnet.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=1&endblock=99999999&sort=asc&apikey=${process.env.NEXT_PUBLIC_BSC_KEY}`
        );
        break;
      case 56:
        rawList = await fetch(
          `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.NEXT_PUBLIC_BSC_KEY}`
        );
        break;
      default:
        rawList = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=6271351&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.NEXT_PUBLIC_ETHER_KEY}`
        );
        break;
    }
    const list = await rawList.json();
    console.log("list", list);
    let item;
    setMessage("Obtaining public key...");
    for (item of list.result) {
      if (item.from.toLowerCase() == address.toLowerCase()) {
        return item.hash;
      }
      continue;
    }
    throw new Error("no transaction found");
  } catch (error) {
    console.log("no transaction found");
    setStep(0);
    setErrorModal([
      "we couldn't find a valid transaction in your address",
    ]);
  }
};

export default getTransaction;

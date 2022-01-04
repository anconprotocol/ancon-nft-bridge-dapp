import { useRecoilState } from "recoil";
import { errorState } from "../atoms/errorAtom";

// get transaction
const getTransaction = async (setStep:React.Dispatch<React.SetStateAction<number>>, address:string, setErrorModal:React.Dispatch<React.SetStateAction<string[]>>) => {
  // const [errorModal, setErrorModal] = useRecoilState(errorState);
  console.log("getting transaction");
  try {
    const rawList = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${"0xf4b935043eb0700af49ed94e13d4d5c6988984f1"}&startblock=6271351&endblock=99999999&page=1&offset=10&sort=asc&apikey=${
        process.env.NEXT_PUBLIC_ETHER_KEY
      }`
    );
    const list = await rawList.json();
    let item;
    for (item of list.result) {
      if (
        item.from == "0xf4b935043eb0700af49ed94e13d4d5c6988984f1" ||
        item.from == address
      ) {
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

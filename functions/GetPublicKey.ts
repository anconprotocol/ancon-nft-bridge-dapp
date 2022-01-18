import { BigNumber, ethers } from "ethers";

type transaction = {
  accessList: null;
  blockHash: string;
  blockNumber: number;
  chainId: number;
  confirmations: number;
  creates: null;
  data: string;
  from: string;
  gasLimit: BigNumber;
  gasPrice: BigNumber;
  hash: string;
  nonce: number;
  r: string;
  s: string;
  to: string;
  transactionIndex: number;
  type: number;
  v: number;
  value: BigNumber;
  wait: any;
};

async function GetPublicKey(transaction:transaction, sig: string, provider: any) {
  // get the txData
  
  const txData = {
    gasPrice: transaction.gasPrice,
    gasLimit: transaction.gasLimit,
    value: transaction.value,
    nonce: transaction.nonce,
    data: transaction.data,
    chainId: transaction.chainId,
    to: transaction.to,
  };

  const rsTx = await ethers.utils.resolveProperties(txData);
  // returns RLP encoded tx
  const raw = ethers.utils.serializeTransaction(rsTx);
  // not sure about this step but it made it work
  const msgHash = ethers.utils.keccak256(raw);
  // create binary hash
  const msgBytes = ethers.utils.arrayify(msgHash);

  const pubkey = ethers.utils.recoverPublicKey(msgBytes, sig);
  
  const recoveredAddress = ethers.utils.recoverAddress(msgBytes, sig);
  console.log(
    "addresses are equal ==>",
    recoveredAddress === transaction.from
  );
  return [recoveredAddress, pubkey];
}

export default GetPublicKey;

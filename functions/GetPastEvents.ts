import { ethers } from "ethers";
import { sleep } from "../pages/create";
import { AnconProtocol__factory } from "../types/ethers-contracts/factories/AnconProtocol__factory";

async function GetPastEvents(
  prov: ethers.providers.Web3Provider,
  contractAddress: string
) {
  const contract1 = AnconProtocol__factory.connect(
    contractAddress,
    prov
  );
  const filter = contract1.filters.HeaderUpdated();
  const from = await prov.getBlockNumber();
  let result = await contract1.queryFilter(filter, from);
  let time = Date.now();
  const maxTime = Date.now() + 120000;
  while (time < maxTime) {
    result = await contract1.queryFilter(filter, from);
    console.log(result);
    if (result.length > 0) {
      break;
    }
    time = Date.now();
    await sleep(10000);
  }
  return true;
}

export default GetPastEvents;

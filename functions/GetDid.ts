import { ethers } from "ethers";

async function GetDid(address:string) {
  const rawDid = await fetch(
    `https://api.ancon.did.pa/v0/did/raw:${address}`
  );
  const encodedDid = await rawDid.json();
  console.log(encodedDid)
  // const decodedDid = await ethers.utils.toUtf8String(
  //   ethers.utils.base64.decode(encodedDid)
  // );
  // const did = await JSON.parse(decodedDid);
  // console.log('did',did)
  return encodedDid
}

export default GetDid;

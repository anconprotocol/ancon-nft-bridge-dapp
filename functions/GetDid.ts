/**
 * 
 * @param address address to get the did from
 * @returns encoded did
 */
async function GetDid(address:string) {
  const rawDid = await fetch(
    `https://api.ancon.did.pa/v0/did/raw:${address}`
  );
  const encodedDid = await rawDid.json();
  return encodedDid
}

export default GetDid;

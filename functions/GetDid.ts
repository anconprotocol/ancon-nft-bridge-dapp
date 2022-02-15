/**
 * 
 * @param address address to get the did from
 * @returns encoded did
 */
async function GetDid(networkName:string, address:string) {
  const rawDid = await fetch(
    `https://api.ancon.did.pa/v0/did/raw:did:ethr:${networkName}:${address}`
  );
  const encodedDid = await rawDid.json();
  return encodedDid
}

export default GetDid;

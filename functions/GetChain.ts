/**
 * gets the addresses from env variables
 * @param {network} network the network object provided from getNetwork()
 * @return {object} returns ancon, dai and xdv addresses based on network
 */
const GetChain = async (network: any) => {
  let anconAddress: any;
  let daiAddress: any;
  let xdvnftAdress: any;
  let wxdv: any;
  switch (network.chainId) {
    case 97:
      anconAddress = process.env.NEXT_PUBLIC_ANCON_bnbt;
      daiAddress = process.env.NEXT_PUBLIC_DAI_bnbt;
      xdvnftAdress = process.env.NEXT_PUBLIC_XDVNFT_bnbt;  
      wxdv = process.env.NEXT_PUBLIC_WXDV_bnbt;    
      break;
    case 42:
      anconAddress = process.env.NEXT_PUBLIC_ANCON_kovan;
      daiAddress = process.env.NEXT_PUBLIC_DAI_kovan;
      xdvnftAdress = process.env.NEXT_PUBLIC_XDVNFT_kovan;
      wxdv = process.env.NEXT_PUBLIC_WXDV_kovan;    
      break;
    case 80001:
      anconAddress = process.env.NEXT_PUBLIC_ANCON_mumbai;
      daiAddress = process.env.NEXT_PUBLIC_DAI_mumbai;
      xdvnftAdress = process.env.NEXT_PUBLIC_XDVNFT_mumbai;
      wxdv = process.env.NEXT_PUBLIC_WXDV_mumbai;    
      break;
  }
  return { ancon: anconAddress, dai: daiAddress, xdv: xdvnftAdress, wxdv };
};

export default GetChain;

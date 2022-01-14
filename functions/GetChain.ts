const GetChain = async (network: any) => {
  let anconAddress: any;
  let daiAddress: any;
  let xdvnftAdress: any;
  switch (network.chainId) {
    case 97:
      anconAddress = process.env.NEXT_PUBLIC_ANCON_bnbt;
      daiAddress = process.env.NEXT_PUBLIC_DAI_bnbt;
      xdvnftAdress = process.env.NEXT_PUBLIC_XDVNFT_bnbt;
      break;
    case 42:
      anconAddress = process.env.NEXT_PUBLIC_ANCON_kovan;
      daiAddress = process.env.NEXT_PUBLIC_DAI_kovan;
      xdvnftAdress = process.env.NEXT_PUBLIC_XDVNFT_kovan;
      break;
  }
  return { ancon: anconAddress, dai: daiAddress, xdv: xdvnftAdress };
};

export default GetChain;

import { ChevronDownIcon } from "@heroicons/react/solid";

interface StepProps{
    handleDrop: () => void;
    network: string;
    showDropdown: string;
    setNetwork: React.Dispatch<React.SetStateAction<string>>;
    setNftAddress: React.Dispatch<React.SetStateAction<string>>;
    nftAddress:string;
    next:() => Promise<void>;
    tokenId:string;
    setTokenId:React.Dispatch<React.SetStateAction<string>>;
}
/**
 * SOURCE STEP
 * @description Handles the network, nft address and token id inputs 
*/
function Step0({
  handleDrop,
  network,
  showDropdown,
  setNetwork,
  setNftAddress,
  nftAddress,
  next,
  tokenId,
  setTokenId,
}: StepProps) {
  return (
    <>
      {/* network */}
      <div className="flex-col flex mt-3">
        <div className="inline-block relative">
          <button
            className="bg-primary-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center shadow-md justify-between"
            onClick={handleDrop}
          >
            <span className="mr-1">{network}</span>
            <ChevronDownIcon className="w-8 text-white"/>
          </button>

          <ul
            className={`absolute text-white pt-1 ${showDropdown} transition-all duration-150`}
          >
            <li
              className=""
              onClick={() => (setNetwork("bnbt"), handleDrop())}
            >
              <a
                className="rounded-t bg-primary-600 hover:bg-primary-500 py-2 px-4 block whitespace-no-wrap transition-all duration-250 ease-out"
                href="#"
              >
                Binance Smart Chain testnet
              </a>
            </li>
            <li
              className=""
              onClick={() => (setNetwork("kovan"), handleDrop())}
            >
              <a
                className="bg-primary-600 hover:bg-primary-500  py-2 px-4 block whitespace-no-wrap rounded-b transition-all duration-250 ease-out"
                href="#"
              >
                Kovan Testnet
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* nft */}
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">NFT Address</a>
        <input
          type="text"
          className="bg-gray-100 rounded-sm h-10 pl-2 shadow-sm"
          onChange={(e) => {
            setNftAddress(e.target.value);
          }}
          value={nftAddress}
        ></input>
      </div>
      {/* token id */}
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">Token ID</a>
        <input
          type="text"
          className="bg-gray-100 rounded-sm h-10 pl-2 shadow-sm"
          onChange={(e) => {
            setTokenId(e.target.value);
          }}
          value={tokenId}
        ></input>
      </div>
      <div>
        <p
          onClick={next}
          className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 select-none"
        >
          Next
        </p>
      </div>
    </>
  );
}

export default Step0;

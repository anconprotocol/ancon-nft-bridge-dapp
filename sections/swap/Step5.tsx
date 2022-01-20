import { useRouter } from "next/router";

interface StepProps {
  network: string;
  nftAddress: string;
  tokenId: string;
  owner: string;
  address: string;
}
/**
 * SHOW STEP
 * @description shows the results for new network, nft address and token id values
 */
function Step5({ network, nftAddress, tokenId, owner, address }: StepProps) {
  const router = useRouter();
  return (
    <div>
      {/* network */}
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">Network</a>
        <p>
          {network === "bnbt"
            ? "Binance SC Testnet"
            : "Kovan Testnet"}
        </p>
      </div>
      {/* nft */}
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">NFT Address</a>
        <p>{nftAddress}</p>
      </div>
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">New Owner</a>
        <p>{owner}</p>
      </div>
      {/* token id */}
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">
          Previous Owner
        </a>
        <p>{address}</p>
      </div>
      <div className="flex-col flex mt-3">
        <a className="text-gray-600 text-sm font-bold">Token ID</a>
        <p>{tokenId}</p>
      </div>
      <div>
        <p
          onClick={() => router.push("/")}
          className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4 select-none"
        >
          Close
        </p>
      </div>
    </div>
  );
}

export default Step5;

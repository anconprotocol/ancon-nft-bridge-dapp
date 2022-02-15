import { NextRouter } from "next/router";

interface StepProps {
  address: string;
  DIDCid: string;
  router: NextRouter;
}
function EnrollStep2({ address, DIDCid, router }: StepProps) {
  return (
    <div className="flex items-center justify-center mt-3">
      <div className="grid grid-cols-1">
        <a className="text-gray-600 text-sm">Domain Name</a>
        <span className="text-lg font-medium mb-2">{address}</span>

        <a className="text-gray-600 text-sm">DID Cid</a>
        <p className="hidden md:inline text-lg font-medium mb-2">
          {DIDCid}
        </p>
        <p className="md:hidden text-lg">
          {DIDCid.substring(0, 30)}...
        </p>
        <p className="md:hidden text-lg">...{DIDCid.substring(30)}</p>

        <div className="flex items-center justify-center mt-3 w-full">
          <div>
            <p
              onClick={() => router.push("/")}
              className="bg-purple-700 border-2 border-purple-700 rounded-lg text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform cursor-pointer mt-4 flex items-center justify-center py-2 px-4"
            >
              Close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnrollStep2;

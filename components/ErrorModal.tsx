import { XIcon } from "@heroicons/react/solid";
import { useRecoilState } from "recoil";
import { errorState } from "../atoms/errorAtom";

function ErrorModal() {
  const [state, setState] = useRecoilState(errorState);
  return (
    <>
      {state?.length !== 0 ? (
        // center the container
        <div className="fixed w-full h-full bg-black flex items-center justify-center bg-opacity-75 z-50 select-none px-4">
          {/* white container */}
          <div className="bg-white py-4 px-4 rounded-lg opacity-100 z-50 relative">
            <div className="w-full flex justify-between pb-2" onClick={() => setState([])}>
            <h1 className="font-bold">Oh no!</h1>
              <XIcon className="w-5 text-gray-700" />
            </div>

            
            <p>{state?.[0]}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ErrorModal;

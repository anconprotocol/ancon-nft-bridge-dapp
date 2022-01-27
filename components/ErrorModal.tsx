import { XIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { errorState } from "../atoms/errorAtom";

function ErrorModal() {
  const [state, setState] = useRecoilState(errorState);
  const router = useRouter();

  return (
    <>
      {state?.length !== 0 ? (
        // center the container
        <div className="fixed w-full h-full bg-black flex items-center justify-center bg-opacity-90 z-50 select-none px-4">
          {/* white container */}
          <div className="bg-white py-4 px-4 rounded-lg opacity-100 z-50 relative">
            <div
              className="w-full flex justify-between pb-2"
            >
              <h1 className="font-bold">Important Message!</h1>
            </div>

            <p>{state?.[0]}</p>
            {state?.length > 1 ? (
              <div className="flex justify-center space-x-10 pt-4">
                <button
                  onClick={() => {
                    setState([]);
                    router.reload();
                  }}
                  className="bg-purple-700 border-2 border-purple-700 rounded-lg px-4 py-2 text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform"
                >
                  {state[1]}
                </button>
                <button
                  onClick={() => {
                    router.push(`${state[4]}`);
                    setState([]);
                  }}
                  className="bg-white-700 border-2 border-purple-700 rounded-lg px-4 py-2 text-black hover:bg-gray-200 transition-all duration-150 hover:shadow-xl active:scale-105 transform"
                >
                  {state[3]}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ErrorModal;

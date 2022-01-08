import { useRecoilState } from "recoil";
import { buttonState, showState } from "../atoms/modalAtom";

function Modal() {
  const [show, setShow] = useRecoilState(showState);
  const [butState, setButState] = useRecoilState(buttonState);
  // console.log("show", show);
  const Connect = () => {
    setButState("connect");
    setShow(false);
  };
  const StickAround = () => {
    setButState("sticking");
    setShow(false);
  };
  return (
    <>
      {show && (
        // center the container
        <div className="fixed w-full h-full bg-black flex items-center justify-center bg-opacity-75 z-50 select-none">
          {/* white container */}
          <div className="bg-white py-4 px-4 rounded-lg opacity-100 z-50">
            <h1 className="font-ligh text-red-500 pb-2 font-mono">
              This is project is a fully functional beta with some
              minor bugs
            </h1>
            <h1 className="font-bold">
              Hey there! Looks like you are not Connected
            </h1>
            <p className="text-gray-700">
              For better experience we recommend to connect the wallet
              to the site. If you do not have a{" "}
              <a
                className="underline"
                href="https://learncrypto.com/blog/keep-learning/what-is-web3-wallet-why-you-might-need-one"
                target="_blank"
                rel="noopener noreferrer"
              >
                Web3 Wallet
              </a>{" "}
              you have to install one, ex:{" "}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Metamask
              </a>
            </p>

            {/* button container */}
            <div className="flex justify-center space-x-10 pt-4">
              <button
                onClick={Connect}
                className="bg-purple-700 border-2 border-purple-700 rounded-lg px-4 py-2 text-white hover:text-black hover:bg-purple-300 transition-all duration-100 hover:shadow-xl active:scale-105 transform"
              >
                Connect
              </button>
              <button
                onClick={StickAround}
                className="bg-white-700 border-2 border-purple-700 rounded-lg px-4 py-2 text-black hover:bg-gray-200 transition-all duration-150 hover:shadow-xl active:scale-105 transform"
              >
                Look around
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Modal;

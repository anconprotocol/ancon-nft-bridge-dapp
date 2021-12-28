import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import Web3 from "web3";
import { addressState } from "../atoms/addressAtom";
import { buttonState, showState } from "../atoms/modalAtom";
import useProvider from "../hooks/useProvider";
import Modal from "./Modal";


declare let window: any;
function Login() {
  const [accounts, setAccounts] = useState<string[]| null>();
  const provider = useProvider();
  const [show, setShow] = useRecoilState(showState);
  const [butState, setButState] = useRecoilState(buttonState);
  const [address, setAddress] = useRecoilState(addressState);
  const [connected, setConnected] = useState(false);
  // creates the web3 object and request the accounts
  const onLogin = async (provider:any) => {
    console.log("calling the provider");
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    setAccounts(accounts);
    setAddress(accounts[0])
    // console.log("accounts", accounts[0]);
  };

  // handles the usual Login every time a user refreshes
  const handleUsualLogin = async () => {
    console.log(provider._state.accounts.length);
    if (provider._state.isUnlocked === false || provider._state.accounts.length === 0) {
      setShow(true);
    } else {
      if (provider) {
        if (provider !== window.ethereum) {
          window.alert("no provided");
        }
        //   call the provider
        await provider.request({
          method: "eth_requestAccounts",
        });
        onLogin(provider);
      }
    }
  };

  // handle the first login when a user isnt connected
  const handleFisrtLogin = async () => {
    if (provider) {
      if (provider !== window.ethereum) {
        window.alert("no provided");
      }
      //   call the provider
      await provider.request({
        method: "eth_requestAccounts",
      });
      onLogin(provider);
    }
  };

  // check if the connect button was pressed
  if (butState == "connect") {
    console.log("here");
    setTimeout(() => {
      handleFisrtLogin();
      setButState("");
    }, 1000);
  }

  useEffect(() => {
    handleUsualLogin();
  }, []);

  return (
    <>
      {accounts && (
        <span className="select-none">{accounts?.[0]?.substring(0, 5)}...{accounts?.[0]?.substring(accounts[0].length - 4)}</span>
      )}
      {accounts == null && (
        <span onClick={handleUsualLogin} className="cursor-pointer animated-underline select-none">Connect</span>
      )}
    </>
  );
}

export default Login;

import { connect } from "http2";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import Web3 from "web3";
import { addressState } from "../atoms/addressAtom";
import { buttonState, showState } from "../atoms/modalAtom";
import useProvider from "../hooks/useProvider";
import Modal from "./Modal";

declare let window: any;
let provider: any;
function Login() {
  const [accounts, setAccounts] = useState<string[] | null>();
  // provider = useProvider();
  const [show, setShow] = useRecoilState(showState);
  const [butState, setButState] = useRecoilState(buttonState);
  const [address, setAddress] = useRecoilState(addressState);
  const [connected, setConnected] = useState(false);
  const router = useRouter();
  provider = useProvider();
  // creates the web3 object and request the accounts
  let changed = "";
  const onLogin = async (provider: any) => {
    console.log("calling the provider");
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      console.log("error");
      return true;
    }
    console.log("out of if");
    setAccounts(accounts);
    changed = accounts[0];
    setAddress(accounts[0]);
    // console.log("accounts", accounts[0]);
  };

  // handles the usual Login every time a user refreshes
  const handleUsualLogin = async () => {
    // console.log(provider._state.accounts)
    if (
      provider._state.isUnlocked === false ||
      provider._state.isConnected === false
    ) {
      // console.log("outside try");
      try {
        const notConnected: any = onLogin(provider);
        if (notConnected) {
          throw "not connected";
        }
      } catch (error) {
        console.log("out cat");
        setShow(true);
      }
    } else {
      // console.log("else prov");
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
        setShow(true);
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
  if (typeof window !== "undefined") {
    // browser code
    window.ethereum.on("accountsChanged", function (accounts: any) {
      console.log("changed");
      setAddress(accounts[0]);
      router.reload();
    });
  }
  useEffect(() => {
    setTimeout(() => {
      handleUsualLogin()
    }, 1000);
  }, []);
  // async function getAccount() {
  //   const accounts = await window.ethereum.enable();
  //   const account = accounts[0];
  //   // do something with new account here
  // }

  return (
    <>
      {accounts && (
        <span className="select-none">
          {accounts?.[0]?.substring(0, 5)}...
          {accounts?.[0]?.substring(accounts[0].length - 4)}
        </span>
      )}
      {accounts == null && (
        <span
          onClick={handleUsualLogin}
          className="cursor-pointer animated-underline select-none"
        >
          Connect
        </span>
      )}
    </>
  );
}

export default Login;

import { DuplicateIcon } from "@heroicons/react/solid";
import { ethers } from "ethers";
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
  const [account, setAccount] = useState<string | null>();
  // provider = useProvider();
  const [show, setShow] = useRecoilState(showState);
  const [butState, setButState] = useRecoilState(buttonState);
  const [address, setAddress] = useRecoilState(addressState);
  const [network, setNetwork] = useState("");
  const router = useRouter();
  provider = useProvider();
  let prov: ethers.providers.Web3Provider;
  // creates the web3 object and request the accounts
  let changed = "";
  const onLogin = async (provider: any) => {
    console.log("calling the provider");
    const web3 = new Web3(provider);
    prov = new ethers.providers.Web3Provider(provider);
    let Network: any = await prov.getNetwork();
    Network = await Network.chainId
    console.log(Network)
    switch (Network) {
      case 97:
        Network = "Binance testnet";
        break;

      case 42:
        Network = "Kovan testnet";
        break;
      case 80001:
        Network = "Mumbai testnet"
        break
      default: 
      try {
        const net = await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: "0x61" }],
        });
        console.log('net', net)
      } catch (switchError:any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x61',
                  chainName: 'Binance SC testnet',
                  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                   
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }
      Network = 'Binance Smart Chain'
    }
    setNetwork(Network);
    const accountsArray = await web3.eth.getAccounts();
    if (accountsArray.length === 0) {
      console.log("error");
      return true;
    }
    console.log("out of if");
    setAccount(accountsArray[0]);
    changed = accountsArray[0];
    setAddress(accountsArray[0]);
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
      console.log("changed account");
      setAddress(accounts[0]);
      router.reload();
    });
    window.ethereum.on('chainChanged', (chainId:any) => {
      console.log("changed account",chainId);
      router.reload();
    });
  }
  useEffect(() => {
    setTimeout(() => {
      handleUsualLogin();
    }, 300);
  }, []);
  // async function getAccount() {
  //   const accounts = await window.ethereum.enable();
  //   const account = accounts[0];
  //   // do something with new account here
  // }

  return (
    <>
      {account && (
        <div className="grid select-none" onClick={() => navigator.clipboard.writeText(account)}>
          <div className="flex cursor-pointer transform active:scale-105 active:text-green-900 transition-all ease-out duration-200">
          <span className="select-none">
            {account.substring(0, 5)}...
            {account.substring(account.length - 4)}
          </span>
          <DuplicateIcon className="w-5 text-gray-600" />
          </div>
          <span className="font-light text-gray-600">{network}</span>
        </div>
      )}
      {account == null && (
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

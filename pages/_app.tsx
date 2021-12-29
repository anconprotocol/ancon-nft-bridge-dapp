import "../styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import Modal from "../components/Modal";
import ErrorModal from "../components/ErrorModal";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Modal />
      <ErrorModal />
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

export default MyApp;

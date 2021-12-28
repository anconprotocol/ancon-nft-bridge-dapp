import "../styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import Modal from "../components/Modal";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Modal />
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

export default MyApp;

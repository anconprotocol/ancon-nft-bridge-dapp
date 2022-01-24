import "../styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import Modal from "../components/Modal";
import ErrorModal from "../components/ErrorModal";
import ProgressBar from "@badrap/bar-of-progress";
import { Router } from "next/router";
import Script from "next/script";

const progress = new ProgressBar({
  size: 4,
  className: "z-50",
  delay: 100,
  color: "#B926A7",
});
Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);
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

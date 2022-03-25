import "../styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import Modal from "../components/Modal";
import ErrorModal from "../components/ErrorModal";
import ProgressBar from "@badrap/bar-of-progress";
import { Router } from "next/router";
import Footer from "../components/Footer";
import Head from "next/head";

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
       <Head>
        <title>Ancon Protocol - Claim Account</title>
        <meta name="description" content="Ancon Protocol - Widgets and tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Modal />
      <ErrorModal />
      <Component {...pageProps} />
      <Footer />
    </RecoilRoot>
  );
}

export default MyApp;

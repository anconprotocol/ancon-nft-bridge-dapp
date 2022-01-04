import Head from "next/head";
import Image from "next/image";
import ButtonCard from "../components/ButtonCard";
import Header from "../components/Header";
import Modal from "../components/Modal";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Nft Bridge</title>
        <meta name="description" content="Nft Bridge" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-gray-50 relative h-screen w-full">
        <Header />
        <section className="md:flex justify-center items-center md:space-x-28 md:mt-36 mt-8 mx-2 grid grid-cols-1 space-y-8 md:space-y-0">
          <ButtonCard
            title="New NFT"
            img="/new-icon.png"
            url="create"
          />
          <ButtonCard
            title="Claim Account"
            img=""
            url="enroll"
          />
        </section>
      </main>
    </div>
  );
}

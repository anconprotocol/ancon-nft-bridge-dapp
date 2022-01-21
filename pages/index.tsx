import { SwitchHorizontalIcon, UserAddIcon, UsersIcon } from "@heroicons/react/solid";
import Head from "next/head";
import Image from "next/image";
import ButtonCard from "../components/ButtonCard";
import Header from "../components/Header";
import Modal from "../components/Modal";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Ancon Protocol - Widgets and tools</title>
        <meta name="description" content="Ancon Protocol - Widgets and tools" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-gray-50 relative h-screen w-full">
        <Header />
        <section className="mt-8 mx-2 grid md:grid-cols-2 xl:grid-cols-3 grid-cols-1">
          <ButtonCard
            title="Mint NFT"
            img="/new-icon.png"
            url="create"
          />
          <ButtonCard
            title="Claim Account"
            img={<UserAddIcon className="w-12 sm:w-20 text-white flex items-center sm:mt-4 2xl:w-32" />}
            url="enroll"
            
          />
          <ButtonCard
            title="Swap"
            url="swap"
            img={<SwitchHorizontalIcon className="w-12 sm:w-20 text-white flex items-center sm:mt-4 2xl:w-32" />}
          />

          <ButtonCard
            title="DID Panama"            
            url="identity"
            img={<UsersIcon className="w-12 sm:w-20 text-white flex items-center sm:mt-4 2xl:w-32" />}
          />
          
          <ButtonCard
            title="Register DAG Network"            
            url="registerdag"
            img={<UsersIcon className="w-12 sm:w-20 text-white flex items-center sm:mt-4 2xl:w-32" />}
          />

           <ButtonCard
            title="Register NFT token"            
            url="registernft"
            img={<UsersIcon className="w-12 sm:w-20 text-white flex items-center sm:mt-4 2xl:w-32" />}
          />
          
        </section>
      </main>
    </div>
  );
}

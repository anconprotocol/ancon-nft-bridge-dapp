import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/solid";
import Login from "./Login";
import { useRecoilValue } from "recoil";
import { addressState } from "../atoms/addressAtom";
function Header() {
  const address = useRecoilValue(addressState);
  return (
    <header className="flex justify-between p-4 items-center shadow-md bg-white">
      {/* left section */}
      <Link passHref href={"/"}>
        <div className="flex md:flex-grow cursor-pointer">
          <img
            className="ifesa-logo"
            src={"/ifesa-logo.png"}
            width={"150px"}
            height={"35px"}
          ></img>
          <img
            src={"/ancon-logo.png"}
            width={"35px"}
            height={"35px"}
            className="ml-2 md:ml-4"
          ></img>
        </div>
      </Link>

      {/* right section */}
      <div className="header-right flex md:justify-end md:flex-shrink items-center md:space-x-3 space-x-1">
        {/* uncomment if you want to add the home */}
        {/* <Link href={"/"}>
            <a className="text-gray-700">Home</a>
          </Link> */}
        {/* <p className="text-sm font-light text-gray-600">Please use BSC Testnet</p> */}
        <UserCircleIcon
          className={`md:w-10 w-8 text-${
            address === "" ? "gray" : "blue"
          }-600`}
        />
        {/* login component */}

        <Login />
      </div>
    </header>
  );
}

export default Header;

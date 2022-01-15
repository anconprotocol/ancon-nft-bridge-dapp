import { UserAddIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useRouter } from "next/router";

interface ButtonCardProps {
  title: string;
  img: string | any;
  url: string;
}
function ButtonCard({ title, img, url }: ButtonCardProps) {
  const router = useRouter();
  return (
    <Link href={`/${url}`} passHref>
      <div className="card-button">
        <div className="flex flex-col items-center md:mt-4 mt-2 h-28 justify-center">
          {img == "/new-icon.png" ? (
            <img src={img} width={"65px"} height={"65px"} alt={img} />
          ) : (
            img
          )}
          <p className="text-white font-bold mt-4 md:text-xl">
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ButtonCard;

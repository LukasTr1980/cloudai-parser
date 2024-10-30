import Link from "next/link";
import Image from "next/image";
import UserAvatar from "../signin/components/UserAvatar";

const Header = () => (
    <header className="bg-gray-100 text-gray-600">
        <div className="container mx-auto flex items-center px-4">
            <Link href="/" className="flex items-center space-x-1">
                <Image
                    src="/images/logo-original.svg"
                    width={150}
                    height={75}
                    alt="Logo"
                />
                <span className=" text-3xl font-extrabold tracking-wide">Tech</span>
            </Link>

            <div className="ml-auto">
                <UserAvatar />
            </div>
        </div>
    </header>
);

export default Header;
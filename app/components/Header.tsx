import Link from "next/link";
import Image from "next/image";

const Header = () => (
    <header className="bg-gray-900 text-white shadow-md ">
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
        </div>
    </header>
)

export default Header;
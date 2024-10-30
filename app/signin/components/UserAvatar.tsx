import { auth } from "@/auth";
import Image from "next/image";
import { AvatarIcon } from "../../components/Icons";

export default async function UserAvatar() {
    const session = await auth();

    if (!session?.user) return null;

    return (
        <div className="rounded-full border border-black overflow-hidden w-10 h-10">
            {session.user.image ? (
                <Image
                    src={session.user.image}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                />
            ) : (
                <AvatarIcon className="w-10 h-10" />
            )}
        </div>
    )
}
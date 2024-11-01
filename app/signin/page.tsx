import { redirect } from "next/navigation";
import { signIn, providerMap } from "@/auth";
import { AuthError } from "next-auth";
import { GoogleIcon } from "../components/Icons";

const SIGNIN_ERROR_URL = "/";

export default async function SignInPage() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-sm">
            <div className="flex flex-col gap-2 items-center border border-gray-300 rounded-md p-4 shadow-md">
                {Object.values(providerMap).map((provider) => (
                    <form
                        key={provider.id}
                        action={async () => {
                            "use server"
                            try {
                                await signIn(provider.id, {
                                    redirectTo: "/",
                                })
                            } catch (error) {
                                if (error instanceof AuthError) {
                                    return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
                                }
                                throw error;
                            }
                        }}
                    >
                        <button type="submit" className="gsi-material-button">
                            <div className="gsi-material-button-content-wrapper">
                                <div className="gsi-material-button-icon">
                                    <GoogleIcon />
                                </div>
                                <div className="gsi-material-button-contents">
                                    Sign in with {provider.name}
                                </div>
                            </div>
                        </button>
                    </form>
                ))}
            </div>
        </div>
    )
}
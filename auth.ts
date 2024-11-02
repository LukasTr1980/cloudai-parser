import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "./app/utils/db";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

const providers: Provider[] = [
    Google,
]

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider();
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })
    .filter((provider) => provider.id !== "credentials")

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers,
    pages: {
        signIn: "/signin",
    },
    adapter: MongoDBAdapter(client),
    callbacks: {
        session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
});
import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./app/utils/db";
import Nodemailer from "next-auth/providers/nodemailer";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

const providers: Provider[] = [
    Google,
    Nodemailer({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
    })
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
    adapter: MongoDBAdapter(clientPromise, {
        databaseName: "tlxtech",
    }),
    callbacks: {
        session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
});
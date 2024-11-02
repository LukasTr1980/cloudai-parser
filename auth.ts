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
        async signIn({ user }) {
            try {
                const db = client.db('tlxtech');
                const userCollection = db.collection('users');

                const existingUser = await userCollection.findOne({ googleId: user.id });

                if (!existingUser) {
                    await userCollection.insertOne({
                        email: user.email,
                        name: user.name,
                        googleId: user.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                    console.info(`New user added to the database: ${user.email}`);
                } else {
                    await userCollection.updateOne(
                        { googleId: user.id },
                        {
                            $set: {
                                email: user.email,
                                name: user.name,
                                updatedAt: new Date(),
                            }
                        }
                    );
                    console.info(`Existing user updated in database: ${user.email}`);
                }

                return true;
            } catch (error) {
                console.error('Error saving user to database:', error);
                throw new Error('Unable to save user information in database.');
            }
        },
        session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
});
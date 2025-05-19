import { NextAuthOptions } from "next-auth";
import { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import connectMongo from "@/lib/mongo";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null
    } & DefaultSession["user"]
  }
  
  interface User {
    id: string
    username: string
    email: string
    profile_picture?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cards: Array<any>  
    pending_friends: Array<string>  
    friends: Array<string>  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trading: Array<any>  
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      async profile(profile) {
        // Generate a username from email or name
        const username = profile.email?.split('@')[0] || profile.name?.replace(/\s+/g, '') || 'user';
        
        return {
          id: profile.sub,
          username: username,
          email: profile.email,
          profile_picture: profile.picture,
          cards: [],
          pending_friends: [],
          friends: [],
          trading: []
        };
      },
    }),
    ...(process.env.MONGODB_URI
      ? [
          EmailProvider({
            server: process.env.EMAIL_SERVER ?? "",
            from: "mail@example.com",
          }),
        ]
      : []),
  ],
  adapter: MongoDBAdapter(connectMongo, {
    collections: {
      Users: "Users", 
    }
  }),

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify-email",
    error: "/auth/error"
  },
};

import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import dbConnect from "@/utils/dbConnect";
import UserModel from "@/model/user";
import bcrypt from "bcryptjs";
import clientPromise from "@/utils/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

interface LoginCredentials {
  email: string;
  password: string;
}

if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
  throw new Error("Missing GITHUB ID or Secret");
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: LoginCredentials | undefined
      ): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        try {
          const user = await UserModel.findOne({
            email: credentials.email,
          }).select("+password +isVerified");
          if (!user) {
            return null;
          }
          if (!user.isVerified) {
            return null;
          }
          if (!user.password) {
            return null;
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return {
              id: user._id.toString(),
              _id: user._id.toString(),
              name: user.name,
              email: user.email,
            };
          } else {
            return null;
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new Error(err.message);
          } else {
            throw new Error("Something went wrong.");
          }
        }
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      await dbConnect();

      await UserModel.findByIdAndUpdate(user.id, {
        name: user.name,
        email: user.email,
        image: user.image,
      });
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user.id || user._id?.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

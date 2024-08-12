// app/api/auth/[...nextauth]/route.ts

import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/db";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (!user) {
          throw new Error("No user found with the given email");
        }

        const isPasswordValid = await argon2.verify(
          user.password,
          credentials!.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  secret: "my-ultra-long-secret",
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.sub;
      session.user.token = jwt.sign(
        { sub: token.sub },
        "my_extra_long_secret",
        { expiresIn: "1h" }
      );
      return session;
    },
  },
};

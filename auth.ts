import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { isEmail, normalizeEmail, normalizePhone } from "@/lib/identifier";
import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Username, email or phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials.identifier !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const identifier = credentials.identifier.trim();
        if (!identifier) {
          return null;
        }

        const conditions: { email?: string; phone?: string; username?: string }[] = [];

        if (isEmail(identifier)) {
          conditions.push({ email: normalizeEmail(identifier) });
        } else {
          const phone = normalizePhone(identifier);
          if (phone) {
            conditions.push({ phone });
          }
          conditions.push({ username: identifier.toLowerCase() });
        }

        const user = await prisma.user.findFirst({
          where: { OR: conditions },
        });

        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      return session;
    },
  },
});

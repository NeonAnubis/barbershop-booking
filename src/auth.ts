import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const DB_VERIFY_INTERVAL_MS = 60 * 60 * 1000; // re-check DB at most once per hour

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, populate the token with user data.
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.lastVerified = Date.now();
        return token;
      }

      // If there's no user ID in the token, invalidate immediately.
      if (!token.id) return null as any;

      // Periodically verify the user still exists in the DB.
      const lastVerified = (token.lastVerified as number) ?? 0;
      const shouldRecheck = Date.now() - lastVerified > DB_VERIFY_INTERVAL_MS;

      if (shouldRecheck) {
        try {
          const exists = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { id: true },
          });

          // User was deleted or never existed — invalidate the session.
          if (!exists) return null as any;

          token.lastVerified = Date.now();
        } catch {
          // DB unreachable — keep the existing token rather than locking everyone out.
        }
      }

      return token;
    },

    async session({ session, token }) {
      // token is null when the jwt callback returned null above.
      if (!token?.id) {
        return { ...session, user: undefined as any };
      }
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      return session;
    },
  },
});

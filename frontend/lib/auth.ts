import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { verifyPassword } from "./password";

const authSecret =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV !== "production"
    ? "feedmind-dev-secret-change-in-production"
    : undefined);

const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "name@example.com" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;
      if (!email || !password) return null;

      if (!isDatabaseConfigured) {
        if (process.env.NODE_ENV === "production") {
          return null;
        }

        // Dev fallback to keep local auth usable before DB setup.
        return {
          id: `dev-${Buffer.from(email).toString("base64url")}`,
          email,
          name: email.split("@")[0],
          image: null,
        };
      }

      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash) return null;
        if (!verifyPassword(password, user.passwordHash)) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      } catch {
        if (process.env.NODE_ENV === "production") {
          return null;
        }

        return {
          id: `dev-${Buffer.from(email).toString("base64url")}`,
          email,
          name: email.split("@")[0],
          image: null,
        };
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: isDatabaseConfigured ? PrismaAdapter(prisma) : undefined,
  secret: authSecret,
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && isDatabaseConfigured && user.email) {
        await prisma.user
          .update({
            where: { email: user.email },
            data: {
              name: user.name ?? undefined,
              image: user.image ?? undefined,
            },
          })
          .catch(() => null);
      }

      // Allow credentials sign-in without adapter session creation
      if (account?.provider === "credentials") return true;
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).provider = (token as any).provider;
        (session.user as any).firstName = (token as any).firstName;
        (session.user as any).lastName = (token as any).lastName;
        (session.user as any).locale = (token as any).locale;
        if (typeof (token as any).picture === "string") {
          session.user.image = (token as any).picture;
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = user.id;
      }

      if (account?.provider) {
        (token as any).provider = account.provider;
      }

      const googleProfile = profile as Record<string, unknown> | undefined;
      if (account?.provider === "google" && googleProfile) {
        (token as any).firstName =
          typeof googleProfile.given_name === "string" ? googleProfile.given_name : undefined;
        (token as any).lastName =
          typeof googleProfile.family_name === "string" ? googleProfile.family_name : undefined;
        (token as any).locale =
          typeof googleProfile.locale === "string" ? googleProfile.locale : undefined;

        if (typeof googleProfile.picture === "string") {
          (token as any).picture = googleProfile.picture;
        }
      }

      return token;
    },
    async redirect({ url, baseUrl }) {
      // Support forwarded URLs (VS Code port forwarding, ngrok, etc.)
      // If the URL is relative, use the current base URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If the URL is on the same origin, allow it
      if (new URL(url).origin === baseUrl) return url;
      // Default to dashboard after successful sign in
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth",
  },
};

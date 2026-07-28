import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../src/db/db";

const baseURL = process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  emailAndPassword: { enabled: true },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: true,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
    },
  },
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://thedevjournal.onrender.com",
    "https://the-dev-journal-five.vercel.app",
  ],
});

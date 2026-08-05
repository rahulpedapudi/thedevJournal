import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../src/db/db";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const isProd = process.env.NODE_ENV === "production";

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
      enabled: isProd,
      domain: ".thedevjournal.xyz",
    },

    disableOriginCheck: true,

    useSecureCookies: isProd,

    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    },
  },
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://thedevjournal.onrender.com",
    "https://the-dev-journal-five.vercel.app",
    "https://api.thedevjournal.xyz",
    "https://app.thedevjournal.xyz",
  ],
});

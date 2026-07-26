import { betterAuth, google } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "../src/db/db";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  // In production, BETTER_AUTH_URL must be the Vercel frontend URL
  // (e.g. https://the-dev-journal-five.vercel.app) because the OAuth
  // callback is proxied through Vercel → Render. This ensures the
  // redirect_uri sent to Google matches the authorized redirect URI.
  baseURL: process.env.BETTER_AUTH_URL,
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
  },
  advanced: {
    crossSubdomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    },
  },
  trustedOrigins: [
    "http://localhost:5173",
    "https://thedevjournal.onrender.com",
    "https://the-dev-journal-five.vercel.app",
  ],
});

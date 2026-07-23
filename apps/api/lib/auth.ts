import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "../src/db/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: "https://thedevjournal.onrender.com", // ← add this
  emailAndPassword: { enabled: true },
  advanced: {
    crossSubdomainCookies: {
      enabled: false, // different root domains, not subdomains
    },
    defaultCookieAttributes: {
      sameSite: "none", // ← required for cross-origin requests
      secure: true, // ← required when sameSite=none
      partitioned: true, // ← optional: CHIPS support for modern browsers
    },
  },
  trustedOrigins: [
    "http://localhost:5173",
    "https://thedevjournal.onrender.com",
    "https://the-dev-journal-five.vercel.app",
  ],
});

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use same origin so Vercel proxies /api/auth/* → Render.
  // This keeps auth cookies first-party on the Vercel domain,
  // which is required for mobile Safari (ITP) to persist the OAuth state cookie.
  baseURL: window.location.origin,
});

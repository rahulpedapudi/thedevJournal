import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Requests go to /api/auth/* on the same origin, which Vercel proxies
  // to the Render API. This makes cookies first-party for Safari ITP.
  baseURL: window.location.origin,
  fetchOptions: {
    credentials: "include",
  },
});

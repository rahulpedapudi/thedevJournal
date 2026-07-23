import { createAuthClient } from "better-auth/react";
import { API_BASE } from "./api";

export const authClient = createAuthClient({
  baseURL: API_BASE,
});

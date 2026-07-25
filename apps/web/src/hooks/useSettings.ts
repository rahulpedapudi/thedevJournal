import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export type LLMProvider = "gemini" | "groq" | "openrouter";

export type UserSettings = {
  id?: string;
  userId?: string;
  defaultProvider?: LLMProvider | string;
  customInstructions?: string;
};

export type UserKey = {
  id?: string;
  userId?: string;
  provider: string;
  key: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Fetch settings for current user */
export function useSettings() {
  return useQuery<UserSettings | null>({
    queryKey: ["settings"],
    queryFn: () =>
      apiFetch("/api/settings").then((res) => {
        if (!res.data || Array.isArray(res.data)) return null;
        return res.data;
      }),
  });
}

/** Update or save user settings */
export function useSaveSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      defaultProvider?: string;
      customInstructions?: string;
    }) =>
      apiFetch("/api/settings", {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

/** Fetch user API keys */
export function useUserKeys() {
  return useQuery<UserKey[]>({
    queryKey: ["userkeys"],
    queryFn: () =>
      apiFetch("/api/keys")
        .then((res) => (Array.isArray(res.data) ? res.data : []))
        .catch(() => []),
  });
}

/** Save or update an API key for a provider */
export function useSaveUserKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { provider: string; key: string }) =>
      apiFetch("/api/keys", {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userkeys"] });
    },
  });
}

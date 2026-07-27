export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/**
 * Thin wrapper around fetch that:
 * - Prepends API_BASE to every path (empty in prod → same-origin via Vercel proxy)
 * - Sets Content-Type: application/json
 * - Sends cookies (session) with every request
 * - Throws on non-2xx responses with the API's error message
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

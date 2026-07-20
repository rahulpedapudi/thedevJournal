export const API_BASE = "http://localhost:3000";

/**
 * Thin wrapper around fetch that:
 * - Prepends API_BASE to every path
 * - Sets Content-Type: application/json
 * - Sends cookies (credentials: "include")
 * - Throws on non-2xx responses with the API's error message
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
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

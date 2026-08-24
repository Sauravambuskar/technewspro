"use client";

/** Thin fetch wrapper for the admin screens: unwraps { ok, data } and throws readable errors. */
export async function api<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init.body ? { "content-type": "application/json", ...init.headers } : init.headers
  });

  let payload: { ok?: boolean; data?: T; error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Unexpected response from the server (${response.status}).`);
  }

  if (!response.ok || !payload.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
  return payload.data as T;
}

export function send(url: string, method: "POST" | "PATCH" | "PUT" | "DELETE", body?: unknown) {
  return api(url, { method, body: body === undefined ? undefined : JSON.stringify(body) });
}

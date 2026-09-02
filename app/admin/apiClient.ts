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

export function send<T = unknown>(url: string, method: "POST" | "PATCH" | "PUT" | "DELETE", body?: unknown) {
  return api<T>(url, { method, body: body === undefined ? undefined : JSON.stringify(body) });
}

/** Multipart upload — no content-type header, so the browser sets the boundary itself. */
export async function uploadFile(file: File): Promise<{ id: string; url: string }> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/uploads", { method: "POST", body: form });

  let payload: { ok?: boolean; data?: { id: string; url: string }; error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Unexpected response from the server (${response.status}).`);
  }

  if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error || `Upload failed (${response.status}).`);
  return payload.data;
}

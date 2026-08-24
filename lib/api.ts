import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import type { PublicUser } from "./types";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

/** Wraps a handler so thrown HttpErrors become clean JSON and everything else is a 500. */
export function handler<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof HttpError) return fail(error.message, error.status);
      console.error("[api]", error);
      return fail("Something went wrong on the server.", 500);
    }
  };
}

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError("You must be signed in to do that.", 401);
  return user;
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError("Request body must be valid JSON.");
  }
}

export function requireString(value: unknown, field: string, { max = 20000 } = {}) {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(`"${field}" is required.`);
  if (value.length > max) throw new HttpError(`"${field}" is too long (max ${max} characters).`);
  return value.trim();
}

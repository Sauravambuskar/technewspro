import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { newId, now, read, update } from "./store";
import type { AdminUser, PublicUser } from "./types";

const USERS = "users";
const SECRET = "secret";
export const SESSION_COOKIE = "tnip_admin";
const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase() || "admin@technewspro.com";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme123";

/* ------------------------------------------------------------------ passwords */

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, digest] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !digest) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* -------------------------------------------------------------------- secrets */

// The stored secret never changes once created, so reading it from the database
// on every request is pure latency. Memoised for the life of the instance.
let secretPromise: Promise<string> | null = null;

async function sessionSecret(): Promise<string> {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;

  if (!secretPromise) {
    // Persisted so sessions survive a dev-server restart without any configuration.
    secretPromise = read<{ value: string }>(SECRET, () => ({ value: randomBytes(32).toString("hex") }))
      .then((stored) => stored.value)
      .catch((error) => {
        secretPromise = null; // let the next request retry
        throw error;
      });
  }
  return secretPromise;
}

/* -------------------------------------------------------------------- users */

function seedUsers(): AdminUser[] {
  return [
    {
      id: newId(),
      email: DEFAULT_ADMIN_EMAIL,
      name: "Editor in chief",
      role: "admin",
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      createdAt: now(),
      lastLoginAt: null
    }
  ];
}

export function toPublicUser(user: AdminUser): PublicUser {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

export async function listUsers(): Promise<PublicUser[]> {
  return (await read<AdminUser[]>(USERS, seedUsers)).map(toPublicUser);
}

export async function findUserByEmail(email: string) {
  const users = await read<AdminUser[]>(USERS, seedUsers);
  return users.find((u) => u.email === email.trim().toLowerCase());
}

export async function findUserById(id: string) {
  const users = await read<AdminUser[]>(USERS, seedUsers);
  return users.find((u) => u.id === id);
}

export async function createUser(input: { email: string; password: string; name?: string; role?: AdminUser["role"] }) {
  const email = input.email.trim().toLowerCase();
  if (await findUserByEmail(email)) throw new Error("An account with that email already exists.");

  const user: AdminUser = {
    id: newId(),
    email,
    name: input.name?.trim() || email.split("@")[0],
    role: input.role || "editor",
    passwordHash: hashPassword(input.password),
    createdAt: now(),
    lastLoginAt: null
  };
  await update<AdminUser[]>(USERS, seedUsers, (current) => [...current, user]);
  return toPublicUser(user);
}

export async function changePassword(id: string, password: string) {
  let changed = false;
  await update<AdminUser[]>(USERS, seedUsers, (current) =>
    current.map((u) => {
      if (u.id !== id) return u;
      changed = true;
      return { ...u, passwordHash: hashPassword(password) };
    })
  );
  return changed;
}

export async function deleteUser(id: string) {
  const users = await read<AdminUser[]>(USERS, seedUsers);
  if (users.length <= 1) throw new Error("You cannot delete the only remaining account.");
  let removed = false;
  await update<AdminUser[]>(USERS, seedUsers, (current) =>
    current.filter((u) => {
      if (u.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

// scrypt is deliberately slow, and this check runs on every admin page render to
// decide whether to show one warning banner. The answer only changes when the
// stored hash does, so memoise against the hash: same hash, same answer, no work.
let defaultPasswordCheck: { hash: string; result: boolean } | null = null;

/** True while the seeded account still uses the fallback password. */
export async function usingDefaultPassword() {
  const user = await findUserByEmail(DEFAULT_ADMIN_EMAIL);
  if (!user) return false;

  if (defaultPasswordCheck?.hash === user.passwordHash) return defaultPasswordCheck.result;

  const result = verifyPassword(DEFAULT_ADMIN_PASSWORD, user.passwordHash);
  defaultPasswordCheck = { hash: user.passwordHash, result };
  return result;
}

/* ------------------------------------------------------------------ sessions */

type SessionPayload = { sub: string; exp: number };

function b64url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

async function sign(value: string) {
  return createHmac("sha256", await sessionSecret()).update(value).digest("base64url");
}

export async function createSessionToken(userId: string) {
  const payload: SessionPayload = { sub: userId, exp: Date.now() + SESSION_MAX_AGE * 1000 };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${await sign(body)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = await sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.sub || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const payload = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await findUserById(payload.sub);
  return user ? toPublicUser(user) : null;
}

export async function authenticate(email: string, password: string): Promise<PublicUser | null> {
  const user = await findUserByEmail(email);
  // Always run a hash so a missing account and a wrong password cost the same.
  const reference = user?.passwordHash ?? hashPassword("no-such-user");
  if (!verifyPassword(password, reference) || !user) return null;

  await update<AdminUser[]>(USERS, seedUsers, (current) =>
    current.map((u) => (u.id === user.id ? { ...u, lastLoginAt: now() } : u))
  );
  return toPublicUser(user);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE
  };
}

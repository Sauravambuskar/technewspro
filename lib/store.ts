import { cache } from "react";
import mysql from "mysql2/promise";

// Collection storage backed by MySQL (Hostinger).
//
// Each collection is one JSON row in `collections`, which keeps the repository
// layer (articles, sections, ticker, …) exactly as it was when this was a file
// store. Serverless instances don't share memory, so the read-modify-write in
// update() is guarded by SELECT … FOR UPDATE inside a transaction rather than by
// an in-process queue.
//
// Reads are deduplicated and batched per request (see requestStore below). The
// database sits a long way from the serverless region, so a round trip costs far
// more than the query itself — a page that reads six collections should pay for
// one trip, not six.

const TABLE = "collections";

let pool: mysql.Pool | null = null;
let schemaReady: Promise<void> | null = null;

// Lazy: a module-level connection would throw during `next build`, before
// DATABASE_URL is available.
export function getPool(): mysql.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Set it to your MySQL connection string, e.g. mysql://user:password@host:3306/database."
      );
    }
    pool = mysql.createPool({
      uri: connectionString,
      // Batching keeps concurrency low, and every new connection costs a full
      // TCP + auth handshake across the Atlantic — so hold a few open instead.
      connectionLimit: 4,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000
    });
  }
  return pool;
}

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS ${TABLE} (
           name       VARCHAR(191) PRIMARY KEY,
           data       JSON NOT NULL,
           updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
         ) ENGINE=InnoDB`
      )
      .then(() => undefined)
      .catch((error) => {
        // Let the next call retry instead of caching the failure forever.
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}

/** MariaDB's JSON type is a LONGTEXT alias, so mysql2 hands the column back as a string. */
function parseData<T>(row: { data: unknown }): T {
  return (typeof row.data === "string" ? JSON.parse(row.data) : row.data) as T;
}

/* -------------------------------------------------- per-request read batching */

type Waiter = { resolve: (value: unknown) => void; reject: (error: unknown) => void };

type RequestStore = {
  /** Collections already read (or being read) during this request. */
  loaded: Map<string, Promise<unknown>>;
  /** Names requested in the current tick, waiting to go out as one query. */
  queued: Map<string, Waiter[]>;
  flushing: boolean;
};

// React's cache() hands back the same object for the whole request, and a fresh
// one for the next — so this is request-scoped, never shared between users.
const requestStore = cache((): RequestStore => ({ loaded: new Map(), queued: new Map(), flushing: false }));

/** Fetches every queued collection in a single round trip. */
async function flush(store: RequestStore) {
  const batch = store.queued;
  store.queued = new Map();
  store.flushing = false;

  const names = Array.from(batch.keys());
  if (names.length === 0) return;

  try {
    await ensureSchema();
    const placeholders = names.map(() => "?").join(", ");
    const [rows] = await getPool().query<mysql.RowDataPacket[]>(
      `SELECT name, data FROM ${TABLE} WHERE name IN (${placeholders})`,
      names
    );

    const found = new Map<string, unknown>();
    for (const row of rows) found.set(row.name as string, parseData(row as { data: unknown }));

    batch.forEach((waiters, name) => {
      // `undefined` means the row doesn't exist yet; read() seeds it.
      const value = found.get(name);
      waiters.forEach((waiter) => waiter.resolve(value));
    });
  } catch (error) {
    batch.forEach((waiters) => waiters.forEach((waiter) => waiter.reject(error)));
  }
}

/** Queues one collection for the next batch. Resolves undefined when it has no row. */
function enqueue(store: RequestStore, name: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const waiters = store.queued.get(name);
    if (waiters) {
      waiters.push({ resolve, reject });
    } else {
      store.queued.set(name, [{ resolve, reject }]);
    }

    if (!store.flushing) {
      store.flushing = true;
      // End of the current microtask tick: every read() started by the same
      // Promise.all has been queued by then, so they all share one query.
      queueMicrotask(() => void flush(store));
    }
  });
}

/** Creates a collection from its seed the first time anything touches it. */
async function seedCollection<T>(name: string, seed: () => T | Promise<T>): Promise<T> {
  const initial = await seed();
  // Another instance may seed the same collection concurrently; first writer wins.
  await getPool().query(`INSERT IGNORE INTO ${TABLE} (name, data) VALUES (?, ?)`, [name, JSON.stringify(initial)]);

  const [settled] = await getPool().query<mysql.RowDataPacket[]>(`SELECT data FROM ${TABLE} WHERE name = ?`, [name]);
  return settled.length > 0 ? parseData<T>(settled[0] as { data: unknown }) : initial;
}

/** Read a collection, creating it from `seed` the first time it is touched. */
export function read<T>(name: string, seed: () => T | Promise<T>): Promise<T> {
  const store = requestStore();

  const already = store.loaded.get(name);
  if (already) return already as Promise<T>;

  const pending = enqueue(store, name).then((value) =>
    value === undefined ? seedCollection(name, seed) : (value as T)
  );

  store.loaded.set(name, pending);
  return pending as Promise<T>;
}

/** Drops a collection from the request cache after it changes underneath us. */
function invalidate(name: string) {
  requestStore().loaded.delete(name);
}

/* ------------------------------------------------------------------- writes */

/** Read-modify-write a collection, holding a row lock for the whole operation. */
export async function update<T>(
  name: string,
  seed: () => T | Promise<T>,
  mutate: (current: T) => T | Promise<T>
): Promise<T> {
  await ensureSchema();
  const conn = await getPool().getConnection();

  try {
    await conn.beginTransaction();

    const [locked] = await conn.query<mysql.RowDataPacket[]>(`SELECT data FROM ${TABLE} WHERE name = ? FOR UPDATE`, [
      name
    ]);

    let current: T;
    if (locked.length > 0) {
      current = parseData<T>(locked[0] as { data: unknown });
    } else {
      current = await seed();
      await conn.query(`INSERT INTO ${TABLE} (name, data) VALUES (?, ?)`, [name, JSON.stringify(current)]);
    }

    const next = await mutate(current);
    await conn.query(`UPDATE ${TABLE} SET data = ? WHERE name = ?`, [JSON.stringify(next), name]);

    await conn.commit();
    invalidate(name);
    return next;
  } catch (error) {
    await conn.rollback().catch(() => undefined);
    throw error;
  } finally {
    conn.release();
  }
}

/** Replace a collection wholesale. */
export async function write<T>(name: string, value: T): Promise<T> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO ${TABLE} (name, data) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data)`,
    [name, JSON.stringify(value)]
  );
  invalidate(name);
  return value;
}

export function newId() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}

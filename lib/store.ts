import { Pool } from "@neondatabase/serverless";

// Collection storage backed by Neon Postgres.
//
// Each collection is one JSONB row in `collections`, which keeps the repository
// layer (articles, sections, ticker, …) exactly as it was when this was a file
// store. Serverless instances don't share memory, so the read-modify-write in
// update() is guarded by SELECT … FOR UPDATE inside a transaction rather than by
// an in-process queue.

const TABLE = "collections";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

// Lazy: a module-level connection would throw during `next build`, before the
// Marketplace integration has injected DATABASE_URL.
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Run `vercel env pull .env.local` locally, or connect the Neon integration to this project."
      );
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS ${TABLE} (
           name       text PRIMARY KEY,
           data       jsonb NOT NULL,
           updated_at timestamptz NOT NULL DEFAULT now()
         )`
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

async function query<T>(text: string, values: unknown[] = []) {
  await ensureSchema();
  return getPool().query<{ data: T }>(text, values);
}

/** Read a collection, creating it from `seed` the first time it is touched. */
export async function read<T>(name: string, seed: () => T | Promise<T>): Promise<T> {
  const existing = await query<T>(`SELECT data FROM ${TABLE} WHERE name = $1`, [name]);
  if (existing.rows.length > 0) return existing.rows[0].data;

  const initial = await seed();
  // Another instance may seed the same collection concurrently; first writer wins.
  await query(`INSERT INTO ${TABLE} (name, data) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`, [
    name,
    JSON.stringify(initial)
  ]);

  const settled = await query<T>(`SELECT data FROM ${TABLE} WHERE name = $1`, [name]);
  return settled.rows.length > 0 ? settled.rows[0].data : initial;
}

/** Read-modify-write a collection, holding a row lock for the whole operation. */
export async function update<T>(
  name: string,
  seed: () => T | Promise<T>,
  mutate: (current: T) => T | Promise<T>
): Promise<T> {
  await ensureSchema();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");

    const locked = await client.query<{ data: T }>(
      `SELECT data FROM ${TABLE} WHERE name = $1 FOR UPDATE`,
      [name]
    );

    let current: T;
    if (locked.rows.length > 0) {
      current = locked.rows[0].data;
    } else {
      current = await seed();
      await client.query(`INSERT INTO ${TABLE} (name, data) VALUES ($1, $2)`, [
        name,
        JSON.stringify(current)
      ]);
    }

    const next = await mutate(current);
    await client.query(`UPDATE ${TABLE} SET data = $2, updated_at = now() WHERE name = $1`, [
      name,
      JSON.stringify(next)
    ]);

    await client.query("COMMIT");
    return next;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/** Replace a collection wholesale. */
export async function write<T>(name: string, value: T): Promise<T> {
  await query(
    `INSERT INTO ${TABLE} (name, data) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [name, JSON.stringify(value)]
  );
  return value;
}

export function newId() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}

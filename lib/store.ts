import mysql from "mysql2/promise";

// Collection storage backed by MySQL (Hostinger).
//
// Each collection is one JSON row in `collections`, which keeps the repository
// layer (articles, sections, ticker, …) exactly as it was when this was a file
// store. Serverless instances don't share memory, so the read-modify-write in
// update() is guarded by SELECT … FOR UPDATE inside a transaction rather than by
// an in-process queue.

const TABLE = "collections";

let pool: mysql.Pool | null = null;
let schemaReady: Promise<void> | null = null;

// Lazy: a module-level connection would throw during `next build`, before
// DATABASE_URL is available.
function getPool(): mysql.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Set it to your MySQL connection string, e.g. mysql://user:password@host:3306/database."
      );
    }
    pool = mysql.createPool(connectionString);
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

/** Read a collection, creating it from `seed` the first time it is touched. */
export async function read<T>(name: string, seed: () => T | Promise<T>): Promise<T> {
  await ensureSchema();
  const [rows] = await getPool().query<mysql.RowDataPacket[]>(`SELECT data FROM ${TABLE} WHERE name = ?`, [name]);
  if (rows.length > 0) return parseData<T>(rows[0] as { data: unknown });

  const initial = await seed();
  // Another instance may seed the same collection concurrently; first writer wins.
  await getPool().query(`INSERT IGNORE INTO ${TABLE} (name, data) VALUES (?, ?)`, [name, JSON.stringify(initial)]);

  const [settled] = await getPool().query<mysql.RowDataPacket[]>(`SELECT data FROM ${TABLE} WHERE name = ?`, [name]);
  return settled.length > 0 ? parseData<T>(settled[0] as { data: unknown }) : initial;
}

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
  return value;
}

export function newId() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}

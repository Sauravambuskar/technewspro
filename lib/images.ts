import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getPool, newId, now } from "./store";

const TABLE = "images";

// Image bytes live in their own table (LONGBLOB), separate from the JSON
// `collections` store — base64-in-JSON would bloat every row by ~33% and
// isn't what that table is for. Articles/resources just hold `/api/uploads/:id`
// as their `image` string, same shape as any external image URL.
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS ${TABLE} (
           id         VARCHAR(36) PRIMARY KEY,
           filename   VARCHAR(255) NOT NULL,
           mime_type  VARCHAR(100) NOT NULL,
           size       INT NOT NULL,
           data       LONGBLOB NOT NULL,
           created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
         ) ENGINE=InnoDB`
      )
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export async function saveImage(file: File): Promise<{ id: string; url: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WEBP, GIF or SVG images are allowed.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Image is too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB).`);
  }

  await ensureSchema();
  const id = newId();
  const buffer = Buffer.from(await file.arrayBuffer());

  await getPool().query(`INSERT INTO ${TABLE} (id, filename, mime_type, size, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [
    id,
    file.name.slice(0, 255),
    file.type,
    buffer.length,
    buffer,
    now()
  ]);

  return { id, url: `/api/uploads/${id}` };
}

export async function getImage(id: string): Promise<{ mimeType: string; data: Buffer } | undefined> {
  await ensureSchema();
  const [rows] = await getPool().query<RowDataPacket[]>(`SELECT mime_type, data FROM ${TABLE} WHERE id = ?`, [id]);
  if (rows.length === 0) return undefined;
  return { mimeType: rows[0].mime_type, data: rows[0].data as Buffer };
}

export async function deleteImage(id: string): Promise<boolean> {
  await ensureSchema();
  const [result] = await getPool().query<ResultSetHeader>(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

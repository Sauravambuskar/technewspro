import { promises as fs } from "fs";
import path from "path";

// A tiny JSON-file database. No external service required: every collection is a
// single JSON file under data/, written atomically and serialised through one queue
// so two concurrent admin requests can't interleave a read-modify-write.

const DATA_DIR = path.join(process.cwd(), "data");

let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function fileFor(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function writeRaw(name: string, value: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = fileFor(name);
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, target);
}

// Assumes the caller already holds the queue (or doesn't need it).
async function readUnlocked<T>(name: string, seed: () => T | Promise<T>): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(fileFor(name), "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const initial = await seed();
    await writeRaw(name, initial);
    return initial;
  }
}

/** Read a collection, creating it from `seed` the first time it is touched. */
export async function read<T>(name: string, seed: () => T | Promise<T>): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(fileFor(name), "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return serialize(() => readUnlocked(name, seed));
  }
}

/** Read-modify-write a collection under the shared lock. */
export async function update<T>(
  name: string,
  seed: () => T | Promise<T>,
  mutate: (current: T) => T | Promise<T>
): Promise<T> {
  return serialize(async () => {
    const next = await mutate(await readUnlocked(name, seed));
    await writeRaw(name, next);
    return next;
  });
}

/** Replace a collection wholesale. */
export async function write<T>(name: string, value: T): Promise<T> {
  return serialize(async () => {
    await writeRaw(name, value);
    return value;
  });
}

export function newId() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}

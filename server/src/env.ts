import * as fsp from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Locate the repo root `.env` regardless of where the process is started from.
 * Walks up from this source file (src/ -> server/ -> repo root) until a
 * `.env` file is found, so running from either the repo root or `server/`
 * always reads the same single source of truth.
 */
async function findRootEnv(): Promise<string | null> {
  let dir = path.resolve(__dirname);
  for (;;) {
    const candidate = path.join(dir, '.env');
    try {
      await fsp.access(candidate);
      return candidate;
    } catch {
      const parent = path.dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  }
}

/**
 * Minimal `.env` loader (no `dotenv` dependency). Reads `KEY=VALUE` lines from
 * the repo root `.env` and populates `process.env` for any key not already set
 * in the environment (environment variables take precedence).
 */
export async function loadEnv(): Promise<void> {
  const envPath = await findRootEnv();
  if (!envPath) return; // no .env file — rely on the environment
  let raw: string;
  try {
    raw = await fsp.readFile(envPath, 'utf8');
  } catch {
    return; // unreadable .env — rely on the environment
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!key || value.length === 0) continue;
    if (process.env[key] === undefined) {
      process.env[key] = stripQuotes(value);
    }
  }
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

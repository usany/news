import * as fsp from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Minimal `.env` loader (no `dotenv` dependency). Reads `KEY=VALUE` lines from
 * the repo root `.env` and populates `process.env` for any key not already set
 * in the environment (environment variables take precedence).
 */
export async function loadEnv(): Promise<void> {
  const root = process.cwd();
  let raw: string;
  try {
    raw = await fsp.readFile(path.join(root, '.env'), 'utf8');
  } catch {
    return; // no .env file — rely on the environment
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

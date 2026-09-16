import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Minimal .env loader.
 *
 * Node's built-in --env-file flag needs Node 22, and if the host runs Node 20
 * the process refuses to start at all — a silent deploy failure for a file that
 * is optional in the first place. Twelve lines here removes that whole class of
 * problem. A missing .env is normal, not an error.
 */
export function loadEnv() {
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(dir, '..', '.env');
  if (!fs.existsSync(file)) return;

  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    // Real environment variables win, so Render's dashboard always overrides.
    if (value && process.env[key] === undefined) process.env[key] = value;
  }
}

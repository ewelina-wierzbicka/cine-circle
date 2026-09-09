import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// tiny .env loader so we avoid adding dotenv just for the test runner.
// Precedence: real process.env > .env.test.local > .env.local
function loadFile(file: string) {
  let raw: string;
  try {
    raw = readFileSync(resolve(process.cwd(), file), 'utf8');
  } catch {
    return;
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadFile('.env.test.local');
loadFile('.env.local');

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const SUPABASE_URL = required('NEXT_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY = required('NEXT_PUBLIC_SUPABASE_ANON_KEY');
export const SUPABASE_SERVICE_KEY = required('SUPABASE_SECRET_KEY');

// Safety guard. The suite runs destructive service-role operations
// (create/delete users, seed rows bypassing RLS). It must never touch a
// remote or production project. `.env.test.local` is gitignored, so on a
// fresh checkout or CI env.ts would otherwise fall back to `.env.local`
// (remote) and run those operations against production. Fail loudly instead.
{
  const host = new URL(SUPABASE_URL).hostname;
  const isLocal = host === '127.0.0.1' || host === 'localhost' || host === '::1';
  if (!isLocal && !process.env.E2E_ALLOW_REMOTE_SUPABASE) {
    throw new Error(
      `Refusing to run e2e against non-local Supabase (${SUPABASE_URL}). ` +
        'Start local Supabase and provide .env.test.local, or set ' +
        'E2E_ALLOW_REMOTE_SUPABASE=1 to override.',
    );
  }
}

export const TEST_USER_EMAIL =
  process.env.TEST_USER_EMAIL ?? 'e2e-persistent@midnightframe.test';
export const TEST_USER_PASSWORD =
  process.env.TEST_USER_PASSWORD ?? 'E2ePersistent!1';

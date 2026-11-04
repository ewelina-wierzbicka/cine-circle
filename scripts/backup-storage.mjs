// Downloads every object in a Supabase Storage bucket to a local directory.
//
//   node scripts/backup-storage.mjs <bucket> <out-dir>
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from the environment.
// The secret key bypasses RLS, which is what lets this read a private bucket
// wholesale. Never run this anywhere the output can be read by someone else.
//
// Uses the Storage REST API through plain fetch so the backup workflow needs no
// npm install. See docs/BACKUPS.md.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const PAGE_SIZE = 1000;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const bucket = process.argv[2];
const outDir = process.argv[3];

if (!supabaseUrl || !secretKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY');
}

if (!bucket || !outDir) {
  throw new Error('Usage: node scripts/backup-storage.mjs <bucket> <out-dir>');
}

const headers = {
  Authorization: `Bearer ${secretKey}`,
  apikey: secretKey,
};

/** One page of `prefix`. Folders come back with a null id, files with a uuid. */
async function listPage(prefix, offset) {
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/list/${encodeURIComponent(bucket)}`,
    {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prefix,
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `List failed for "${prefix}" (${response.status}): ${await response.text()}`,
    );
  }

  return response.json();
}

/** Every file path under `prefix`, walking folders depth-first. */
async function listPaths(prefix) {
  const paths = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const entries = await listPage(prefix, offset);

    for (const entry of entries) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) {
        paths.push(...(await listPaths(path)));
      } else {
        paths.push(path);
      }
    }

    if (entries.length < PAGE_SIZE) {
      return paths;
    }
  }
}

async function download(path) {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encoded}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(
      `Download failed for "${path}" (${response.status}): ${await response.text()}`,
    );
  }

  const target = join(outDir, bucket, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await response.arrayBuffer()));
}

const paths = await listPaths('');

// Sequential on purpose. These buckets are small and a backup job has no
// deadline worth risking a rate limit for.
for (const path of paths) {
  await download(path);
}

process.stdout.write(`Backed up ${paths.length} object(s) from "${bucket}".\n`);

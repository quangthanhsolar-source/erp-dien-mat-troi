/**
 * Reads mcp-merged/batchN.json and prints { ok, tag, err }.
 * Intended for agent: load JSON with node, pass query to execute_sql.
 * Optional: set SUPABASE_ACCESS_TOKEN for direct Management API (same as exec-decoded-via-fetch).
 */
import fs from 'fs';
import path from 'path';

const tag = process.argv[2] ?? '0';
const mergedJson = path.join(
  process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp',
  'mcp-merged',
  `batch${tag}.json`
);
const { project_id, query } = JSON.parse(fs.readFileSync(mergedJson, 'utf8'));

function getToken() {
  const candidates = [
    path.join(process.env.APPDATA || '', 'supabase', 'access-token'),
    path.join(process.env.USERPROFILE || '', '.supabase', 'access-token'),
  ];
  for (const p of candidates) {
    try {
      const t = fs.readFileSync(p, 'utf8').trim();
      if (t) return t;
    } catch {}
  }
  return process.env.SUPABASE_ACCESS_TOKEN || '';
}

const token = getToken();
if (!token) {
  process.stdout.write(JSON.stringify({ mode: 'mcp', project_id, query_len: query.length, query }));
  process.exit(0);
}

const url = `https://api.supabase.com/v1/projects/${project_id}/database/query`;
const res = await fetch(url, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});
const text = await res.text();
if (!res.ok) {
  console.error(JSON.stringify({ ok: false, tag, status: res.status, err: text.slice(0, 500) }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, tag }));

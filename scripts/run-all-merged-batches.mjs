/**
 * Runs merged-decoded batchN.sql via Supabase Management API when token exists.
 * Otherwise prints batch indices for agent MCP execute_sql.
 */
import fs from 'fs';
import path from 'path';

const merged = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'merged-decoded');

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
const projectId = 'ceiuwiamqszmxmqtbemy';
const url = `https://api.supabase.com/v1/projects/${projectId}/database/query`;

async function runBatch(b) {
  const query = fs.readFileSync(path.join(merged, `batch${b}.sql`), 'utf8');
  if (!token) {
    return { b, mode: 'mcp', len: query.length };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`batch${b} ${res.status} ${text.slice(0, 300)}`);
  return { b, ok: true };
}

const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? 7);
const concurrency = Number(process.argv[4] ?? 4);

const batches = [];
for (let b = start; b <= end; b++) batches.push(b);

for (let i = 0; i < batches.length; i += concurrency) {
  const slice = batches.slice(i, i + concurrency);
  const results = await Promise.all(slice.map(runBatch));
  console.log(JSON.stringify(results));
}

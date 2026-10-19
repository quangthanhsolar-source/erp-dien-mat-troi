/**
 * Run all crm-tiny tNNN.sql via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN in env or ~/.supabase/access-token
 */
import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\crm-tiny';
const projectId = 'ceiuwiamqszmxmqtbemy';
const progressPath = 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\tiny-progress.json';

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
  console.error('NO_TOKEN');
  process.exit(2);
}

let progress = { ok: [] };
try {
  progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
} catch {}
progress.ok = progress.ok ?? [];

const url = `https://api.supabase.com/v1/projects/${projectId}/database/query`;
const start = parseInt(process.argv[2] ?? '4', 10);
const end = parseInt(process.argv[3] ?? '122', 10);
const concurrency = 4;

async function runOne(i) {
  const name = `t${String(i).padStart(3, '0')}`;
  if (progress.ok.includes(name)) return { name, skipped: true };
  const query = fs.readFileSync(path.join(dir, `${name}.sql`), 'utf8');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) return { name, ok: false, status: res.status, error: text.slice(0, 300) };
  progress.ok.push(name);
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  return { name, ok: true };
}

const pending = [];
for (let i = start; i <= end; i++) {
  const name = `t${String(i).padStart(3, '0')}`;
  if (!progress.ok.includes(name)) pending.push(i);
}

for (let p = 0; p < pending.length; p += concurrency) {
  const chunk = pending.slice(p, p + concurrency);
  const results = await Promise.all(chunk.map(runOne));
  console.log(JSON.stringify(results));
  const fail = results.find((r) => r.ok === false);
  if (fail) {
    console.error('STOP_ON_FAIL', fail);
    process.exit(1);
  }
}

console.log('DONE', progress.ok.length);

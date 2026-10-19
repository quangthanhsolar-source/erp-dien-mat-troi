import fs from 'fs';
import path from 'path';

const decodedDir = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'crm-decoded');
const projectId = 'ceiuwiamqszmxmqtbemy';
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? 30);
const concurrency = Number(process.argv[4] ?? 4);

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

const url = `https://api.supabase.com/v1/projects/${projectId}/database/query`;

async function runOne(i) {
  const tag = String(i).padStart(2, '0');
  const query = fs.readFileSync(path.join(decodedDir, `d${tag}.sql`), 'utf8');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`d${tag} ${res.status} ${text.slice(0, 400)}`);
  return `d${tag} ok`;
}

const indices = [];
for (let i = start; i <= end; i++) indices.push(i);

for (let p = 0; p < indices.length; p += concurrency) {
  const batch = indices.slice(p, p + concurrency);
  console.log(await Promise.all(batch.map(runOne)).then((a) => a.join(', ')));
}

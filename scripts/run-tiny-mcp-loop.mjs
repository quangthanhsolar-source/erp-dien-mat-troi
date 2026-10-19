/**
 * Executes tiny-mcp-args tNNN.json via Supabase Management API (needs access token).
 * Fallback when MCP-only: prints file list for agent batching.
 */
import fs from 'fs';
import path from 'path';

const tmp = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'tiny-mcp-args');
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? 122);
const concurrency = Number(process.argv[4] ?? 4);
const projectId = 'ceiuwiamqszmxmqtbemy';
const tokenPath = path.join(process.env.USERPROFILE || '', '.supabase', 'access-token');
let token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token && fs.existsSync(tokenPath)) token = fs.readFileSync(tokenPath, 'utf8').trim();

async function runFile(n) {
  const tag = String(n).padStart(3, '0');
  const j = JSON.parse(fs.readFileSync(path.join(tmp, `t${tag}.json`), 'utf8'));
  if (!token) return { tag, skip: 'NO_TOKEN' };
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: j.query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`t${tag} ${res.status} ${text.slice(0, 300)}`);
  return { tag, ok: true };
}

const nums = [];
for (let n = start; n <= end; n++) nums.push(n);

if (!token) {
  console.log('NO_TOKEN — need MCP execute_sql for:', nums.map((n) => `t${String(n).padStart(3, '0')}`).join(' '));
  process.exit(2);
}

for (let p = 0; p < nums.length; p += concurrency) {
  const batch = nums.slice(p, p + concurrency);
  const results = await Promise.all(batch.map(runFile));
  console.log(results.map((r) => (r.ok ? `${r.tag} ok` : r.skip)).join(', '));
}

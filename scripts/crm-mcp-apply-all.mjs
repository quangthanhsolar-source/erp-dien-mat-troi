/**
 * Apply all invoke JSON files via Supabase Management API (needs access token in env).
 * Usage: set SUPABASE_ACCESS_TOKEN=... && node crm-mcp-apply-all.mjs glob-or-dir
 */
import fs from 'fs';
import path from 'path';

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
if (!token) {
  console.error('NO_TOKEN set SUPABASE_ACCESS_TOKEN');
  process.exit(2);
}

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error('usage: node crm-mcp-apply-all.mjs <json-file>...');
  process.exit(1);
}

async function execOne(file) {
  const { project_id, query } = JSON.parse(fs.readFileSync(file, 'utf8'));
  const url = `https://api.supabase.com/v1/projects/${project_id}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path.basename(file)} ${res.status} ${text.slice(0, 400)}`);
  return { file: path.basename(file), len: query.length };
}

const concurrency = 5;
let i = 0;
const results = [];
async function worker() {
  while (i < targets.length) {
    const idx = i++;
    const file = targets[idx];
    results.push(await execOne(file));
    console.log('OK', results[results.length - 1].file, results[results.length - 1].len);
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, () => worker()));
console.log('DONE', results.length);

/**
 * Reads {project_id, query} JSON and executes via Supabase Management API when token exists.
 * Without token, prints MCP_REQUIRED and exits 2 (agent must use execute_sql).
 */
import fs from 'fs';
import path from 'path';

const file = process.argv[2];
if (!file) {
  console.error('usage: node crm-mcp-exec-json-path.mjs <json-path>');
  process.exit(1);
}
const { project_id, query } = JSON.parse(fs.readFileSync(file, 'utf8'));

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
  console.error('MCP_REQUIRED', file, query.length);
  process.exit(2);
}

const url = `https://api.supabase.com/v1/projects/${project_id}/database/query`;
const res = await fetch(url, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});
const text = await res.text();
if (!res.ok) {
  console.error('FAIL', file, res.status, text.slice(0, 300));
  process.exit(1);
}
console.log('OK', path.basename(file), query.length);

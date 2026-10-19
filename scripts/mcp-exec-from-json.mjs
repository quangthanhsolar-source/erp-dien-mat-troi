/**
 * Executes SQL from mcp-batch/dXX.json or mcp-merged/batchN.json via Management API.
 * Usage: set SUPABASE_ACCESS_TOKEN then node mcp-exec-from-json.mjs path/to/file.json
 */
import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node mcp-exec-from-json.mjs <json-path>');
  process.exit(1);
}
const { project_id, query } = JSON.parse(fs.readFileSync(file, 'utf8'));
const token =
  process.env.SUPABASE_ACCESS_TOKEN ||
  (() => {
    try {
      return fs.readFileSync(`${process.env.APPDATA}/supabase/access-token`, 'utf8').trim();
    } catch {
      return '';
    }
  })();
if (!token) {
  console.error('NO_TOKEN — use Supabase MCP execute_sql with this file instead:', file);
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
  console.error(res.status, text.slice(0, 500));
  process.exit(1);
}
console.log('OK', file, query.length);

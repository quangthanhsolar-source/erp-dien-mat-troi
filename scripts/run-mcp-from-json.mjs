/**
 * Prints instructions + validates JSON payloads for Supabase MCP execute_sql.
 * Usage: node run-mcp-from-json.mjs d01 [d02 ...]
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const tags = process.argv.slice(2);
if (!tags.length) {
  console.error('usage: node run-mcp-from-json.mjs 01 02 ...');
  process.exit(1);
}

for (const tag of tags) {
  const t = String(tag).padStart(2, '0');
  const p = path.join(tmp, `mcp-args-d${t}.json`);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const hash = Buffer.from(j.query).toString('base64').slice(0, 16);
  console.log(`d${t}`, 'qlen', j.query.length, 'b64prefix', hash);
}

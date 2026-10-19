/**
 * Prepares per-batch MCP arg files for decoded DO SQL (d00-d30).
 * Agent: Read Temp/mcp-batch/dXX.json → execute_sql with exact JSON (no paste from chat).
 *
 * Usage: node exec-decoded-mcp-loop.mjs [start] [end]
 */
import fs from 'fs';
import path from 'path';

const decoded = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'crm-decoded');
const out = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'mcp-batch');
const start = Number(process.argv[2] ?? 0);
const end = Number(process.argv[3] ?? 30);
fs.mkdirSync(out, { recursive: true });

for (let i = start; i <= end; i++) {
  const tag = String(i).padStart(2, '0');
  const query = fs.readFileSync(path.join(decoded, `d${tag}.sql`), 'utf8');
  const j = { project_id: 'ceiuwiamqszmxmqtbemy', query };
  fs.writeFileSync(path.join(out, `d${tag}.json`), JSON.stringify(j), 'utf8');
  console.log(tag, query.length);
}

/**
 * Print MCP execute_sql args for DO files dXX (for agent batching).
 * Usage: node mcp-exec-do-range.mjs 0 3
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const project_id = 'ceiuwiamqszmxmqtbemy';
const a = parseInt(process.argv[2] ?? '0', 10);
const b = parseInt(process.argv[3] ?? '30', 10);

for (let i = a; i <= b; i++) {
  const tag = `d${String(i).padStart(2, '0')}`;
  const file = path.join(tmp, 'crm-b64-do', `${tag}.sql`);
  if (!fs.existsSync(file)) {
    console.error('missing', file);
    continue;
  }
  const query = fs.readFileSync(file, 'utf8');
  const out = path.join(tmp, `mcp-query-${tag}.json`);
  fs.writeFileSync(out, JSON.stringify({ project_id, query }));
  console.log(tag, query.length, out);
}

/**
 * Build combo MCP JSON payloads from _mcp-part-NNN.json (4 parts per combo by default).
 * Usage: node crm-build-combo-mcp.mjs [fromPart] [toPart] [label]
 * Example: node crm-build-combo-mcp.mjs 6 9 006-009
 */
import fs from 'fs';
import path from 'path';

const cursorDir = path.join(process.cwd(), '.cursor');
const from = parseInt(process.argv[2] ?? '2', 10);
const to = parseInt(process.argv[3] ?? '5', 10);
const label = process.argv[4] ?? `${String(from).padStart(3, '0')}-${String(to).padStart(3, '0')}`;

const q = [];
for (let i = from; i <= to; i++) {
  const tag = String(i).padStart(3, '0');
  const p = path.join(cursorDir, `_mcp-part-${tag}.json`);
  if (!fs.existsSync(p)) {
    console.error('missing', p);
    process.exit(1);
  }
  q.push(JSON.parse(fs.readFileSync(p, 'utf8')).query);
}
const query = q.join('\n');
const outSql = path.join(cursorDir, `_combo-${label}.sql`);
const outJson = path.join(cursorDir, `_mcp-call-combo-${label}.json`);
fs.writeFileSync(outSql, query);
fs.writeFileSync(
  outJson,
  JSON.stringify({ project_id: 'ceiuwiamqszmxmqtbemy', query })
);
console.log(JSON.stringify({ label, qlen: query.length, outJson }));

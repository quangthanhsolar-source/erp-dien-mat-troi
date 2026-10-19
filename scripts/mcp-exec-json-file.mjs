/**
 * Agent helper: prints next batch tags + paths for execute_sql.
 * Full query must be passed verbatim from JSON (never truncated in chat).
 *
 * Usage:
 *   node mcp-exec-json-file.mjs next 4
 *   node mcp-exec-json-file.mjs mark d00
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const donePath = path.join(tmp, 'mcp-done.txt');
const done = new Set(
  fs.existsSync(donePath) ? fs.readFileSync(donePath, 'utf8').trim().split(/\s+/).filter(Boolean) : []
);

const cmd = process.argv[2];
if (cmd === 'mark') {
  const tag = process.argv[3];
  if (!tag) process.exit(1);
  done.add(tag);
  fs.writeFileSync(donePath, [...done].sort().join('\n') + '\n');
  console.log('marked', tag);
  process.exit(0);
}

const n = parseInt(process.argv[3] || '4', 10);
const pending = [];
for (let i = 0; i <= 30; i++) {
  const tag = `d${String(i).padStart(2, '0')}`;
  const jpath = path.join(tmp, `mcp-query-${tag}.json`);
  if (!done.has(tag) && fs.existsSync(jpath)) pending.push({ tag, jpath });
}
const batch = pending.slice(0, n);
console.log(JSON.stringify({ pending: pending.length, batch }, null, 2));

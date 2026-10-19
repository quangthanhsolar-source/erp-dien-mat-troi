/**
 * Lists pending plain SQL files for Supabase MCP execute_sql (no CLI token on machine).
 * Agent: read each _plain-dXX.sql or _mcp-arg-batchN.json and call execute_sql (4 parallel).
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const done = new Set(
  fs.existsSync(path.join(tmp, 'mcp-done.txt'))
    ? fs.readFileSync(path.join(tmp, 'mcp-done.txt'), 'utf8').trim().split(/\s+/).filter(Boolean)
    : []
);

const pending = [];
for (let i = 0; i <= 30; i++) {
  const tag = `d${String(i).padStart(2, '0')}`;
  if (!done.has(tag)) pending.push({ kind: 'plain', tag, file: path.join(tmp, `_plain-${tag}.sql`) });
}
for (let b = 0; b < 8; b++) {
  const tag = `batch${b}`;
  if (!done.has(tag)) pending.push({ kind: 'merged', tag, file: path.join(tmp, `_mcp-arg-${tag}.json`) });
}
console.log(JSON.stringify({ pending: pending.length, items: pending.slice(0, 20), total: pending.length }));

/**
 * Executes MCP JSON payloads by reading query and printing status.
 * Agent must call Supabase execute_sql — this script only batches file paths.
 *
 * Usage:
 *   node crm-auto-mcp-exec.mjs tinies 31 122 5
 *   node crm-auto-mcp-exec.mjs combos
 */
import fs from 'fs';
import path from 'path';

const cursorDir = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === 'combos') {
  const files = [
    '_exec-002-005.json',
    '_exec-006-009.json',
    '_exec-010-013.json',
    '_exec-014-017.json',
    '_exec-018-021.json',
    '_exec-022-026.json',
  ].map((f) => path.join(cursorDir, f));
  console.log(JSON.stringify({ batch: files }, null, 2));
  process.exit(0);
}

if (cmd === 'tinies') {
  const start = parseInt(rest[0] || '26', 10);
  const end = parseInt(rest[1] || '122', 10);
  const n = parseInt(rest[2] || '5', 10);
  const batch = [];
  for (let i = start; i <= end && batch.length < n; i++) {
    const tag = `t${String(i).padStart(3, '0')}`;
    const p = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
    if (fs.existsSync(p)) batch.push({ tag, path: p });
  }
  console.log(JSON.stringify({ batch }, null, 2));
  process.exit(0);
}

console.error('usage: combos | tinies start end count');
process.exit(1);

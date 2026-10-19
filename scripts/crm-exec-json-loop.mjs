/**
 * Agent helper: execute many MCP JSON payloads via Supabase MCP only when run by agent.
 * This script prints each file path; agent must CallDynamicTool execute_sql per file.
 *
 * Usage: node crm-exec-json-loop.mjs list-parts 2 26
 *        node crm-exec-json-loop.mjs list-tinies 31 122
 *        node crm-exec-json-loop.mjs list-combos
 */
import fs from 'fs';
import path from 'path';

const cursorDir = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const [cmd, ...rest] = process.argv.slice(2);

function printBatch(items) {
  for (let i = 0; i < items.length; i += 5) {
    console.log(JSON.stringify({ wave: i / 5 + 1, batch: items.slice(i, i + 5) }));
  }
}

if (cmd === 'list-parts') {
  const start = parseInt(rest[0] || '2', 10);
  const end = parseInt(rest[1] || '26', 10);
  const items = [];
  for (let i = start; i <= end; i++) {
    const p = path.join(cursorDir, `_run-${String(i).padStart(3, '0')}.json`);
    if (fs.existsSync(p)) items.push({ tag: `part-${String(i).padStart(3, '0')}`, path: p });
  }
  printBatch(items);
} else if (cmd === 'list-tinies') {
  const start = parseInt(rest[0] || '26', 10);
  const end = parseInt(rest[1] || '122', 10);
  const items = [];
  for (let i = start; i <= end; i++) {
    const tag = `t${String(i).padStart(3, '0')}`;
    const p = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
    if (fs.existsSync(p)) items.push({ tag, path: p });
  }
  printBatch(items);
} else if (cmd === 'list-combos') {
  const items = [
    '_exec-002-005.json',
    '_exec-006-009.json',
    '_exec-010-013.json',
    '_exec-014-017.json',
    '_exec-018-021.json',
    '_exec-022-026.json',
  ].map((f) => ({ tag: f.replace('_exec-', 'combo-').replace('.json', ''), path: path.join(cursorDir, f) }));
  printBatch(items);
} else {
  console.error('usage: list-parts|list-tinies|list-combos');
  process.exit(1);
}

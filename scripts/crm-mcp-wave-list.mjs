/**
 * Lists _exec-tNNN.json paths for agent MCP waves (5-wide).
 * Usage: node crm-mcp-wave-list.mjs 66 122
 */
import fs from 'fs';
import path from 'path';

const a = parseInt(process.argv[2] ?? '61', 10);
const b = parseInt(process.argv[3] ?? '122', 10);
const dir = path.join(process.cwd(), '.cursor');
const files = [];
for (let n = a; n <= b; n++) {
  const tag = `t${String(n).padStart(3, '0')}`;
  const p = path.join(dir, `_exec-${tag}.json`);
  if (fs.existsSync(p)) files.push(p);
}
console.log(JSON.stringify(files));

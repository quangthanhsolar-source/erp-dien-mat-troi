/**
 * Print tiny batch tags still to run (for agent MCP loop).
 * Usage: node mcp-exec-tiny-range.mjs 26 122 5
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const argsDir = path.join(tmp, 'tiny-mcp-args');
const start = parseInt(process.argv[2] ?? '11', 10);
const end = parseInt(process.argv[3] ?? '122', 10);
const chunk = parseInt(process.argv[4] ?? '5', 10);

const tags = [];
for (let i = start; i <= end; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const p = path.join(argsDir, `${tag}.json`);
  if (fs.existsSync(p)) tags.push(tag);
}

const batch = tags.slice(0, chunk);
for (const tag of batch) {
  const j = JSON.parse(fs.readFileSync(path.join(argsDir, `${tag}.json`), 'utf8'));
  console.log(JSON.stringify({ tag, qlen: j.query.length }));
}
console.log(JSON.stringify({ remaining: tags.length, next: batch }));

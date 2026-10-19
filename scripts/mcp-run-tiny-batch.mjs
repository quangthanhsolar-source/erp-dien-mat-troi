/** Next N tiny batch JSON paths for MCP execute_sql (4-wide). */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const dir = path.join(tmp, 'tiny-mcp-args');
const donePath = path.join(tmp, 'tiny-mcp-done.txt');
const done = new Set(
  fs.existsSync(donePath) ? fs.readFileSync(donePath, 'utf8').trim().split(/\s+/).filter(Boolean) : []
);

const n = parseInt(process.argv[2] || '4', 10);
const all = fs
  .readdirSync(dir)
  .filter((f) => /^t\d+\.json$/i.test(f))
  .sort();
const pending = all.filter((f) => !done.has(f.replace(/\.json$/i, '')));
const batch = pending.slice(0, n).map((f) => path.join(dir, f));
console.log(JSON.stringify({ pending: pending.length, batch }, null, 2));

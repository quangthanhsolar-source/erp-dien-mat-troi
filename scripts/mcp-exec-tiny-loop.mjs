/**
 * Stages tiny-mcp-args JSON into .cursor/_tiny-tNNN.json for agent execute_sql (4-wide).
 * Usage: node mcp-exec-tiny-loop.mjs 4 7   # stage t004..t007
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const outDir = path.join(process.cwd(), '.cursor');
const start = parseInt(process.argv[2] ?? '0', 10);
const end = parseInt(process.argv[3] ?? '122', 10);
const tags = [];
for (let i = start; i <= end; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const src = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
  if (!fs.existsSync(src)) continue;
  const j = JSON.parse(fs.readFileSync(src, 'utf8'));
  fs.writeFileSync(path.join(outDir, `_tiny-${tag}.json`), JSON.stringify(j));
  tags.push(tag);
}
console.log(JSON.stringify({ staged: tags.length, tags: tags.slice(0, 8) }));

/** Copy mcp-query-dXX.json payloads to .cursor/_q-dXX.json for agent MCP batching. */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const outDir = path.join(process.cwd(), '.cursor');
const start = parseInt(process.argv[2] ?? '0', 10);
const end = parseInt(process.argv[3] ?? '30', 10);

for (let i = start; i <= end; i++) {
  const tag = `d${String(i).padStart(2, '0')}`;
  const src = path.join(tmp, `mcp-query-${tag}.json`);
  if (!fs.existsSync(src)) {
    console.error('MISSING', src);
    continue;
  }
  const j = JSON.parse(fs.readFileSync(src, 'utf8'));
  fs.writeFileSync(path.join(outDir, `_q-${tag}.json`), JSON.stringify(j));
  console.log(tag, j.query.length);
}

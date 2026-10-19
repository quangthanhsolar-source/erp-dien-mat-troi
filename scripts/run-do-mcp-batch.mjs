/** Print one line per batch: name + query length for agent MCP calls */
import fs from 'fs';
import path from 'path';

const tmp = 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const start = Number(process.argv[2] ?? 1);
const end = Number(process.argv[3] ?? 30);

for (let i = start; i <= end; i++) {
  const tag = String(i).padStart(2, '0');
  const jpath = path.join(tmp, `exec-d${tag}.json`);
  const j = JSON.parse(fs.readFileSync(jpath, 'utf8'));
  console.log(`d${tag}`, j.query.length);
}

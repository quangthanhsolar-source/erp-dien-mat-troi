import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
const start = parseInt(process.argv[2] || '2', 10);
const end = parseInt(process.argv[3] || '26', 10);
for (let i = start; i <= end; i++) {
  const tag = String(i).padStart(3, '0');
  const src = path.join(cursor, `_run-${tag}.json`);
  if (!fs.existsSync(src)) continue;
  const j = JSON.parse(fs.readFileSync(src, 'utf8'));
  fs.writeFileSync(path.join(cursor, `_payload-${tag}.json`), JSON.stringify(j));
}
console.log('payloads', start, end);

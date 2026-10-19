import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\crm-tiny';
const start = parseInt(process.argv[2] ?? '0', 10);
const count = parseInt(process.argv[3] ?? '4', 10);
const outDir = path.join('C:\\Users\\Administrator\\AppData\\Local\\Temp', 'tiny-mcp-args');
fs.mkdirSync(outDir, { recursive: true });

for (let i = start; i < start + count && i <= 122; i++) {
  const name = `t${String(i).padStart(3, '0')}`;
  const query = fs.readFileSync(path.join(dir, `${name}.sql`), 'utf8');
  const payload = { project_id: 'ceiuwiamqszmxmqtbemy', query, _batch: name };
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(payload));
  console.log(name, query.length);
}

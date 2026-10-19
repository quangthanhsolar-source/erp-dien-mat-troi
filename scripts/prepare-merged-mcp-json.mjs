import fs from 'fs';
import path from 'path';

const merged = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'merged-decoded');
const out = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'mcp-merged');
fs.mkdirSync(out, { recursive: true });
for (let b = 0; b < 8; b++) {
  const query = fs.readFileSync(path.join(merged, `batch${b}.sql`), 'utf8');
  fs.writeFileSync(
    path.join(out, `batch${b}.json`),
    JSON.stringify({ project_id: 'ceiuwiamqszmxmqtbemy', query }),
    'utf8'
  );
  console.log('batch' + b, query.length);
}

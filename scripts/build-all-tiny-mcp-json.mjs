/** Write %TEMP%/tiny-mcp-args/tNNN.json for t000..t122 from crm-tiny SQL files */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const src = path.join(tmp, 'crm-tiny');
const out = path.join(tmp, 'tiny-mcp-args');
const project_id = 'ceiuwiamqszmxmqtbemy';
fs.mkdirSync(out, { recursive: true });

for (let i = 0; i <= 122; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const sqlPath = path.join(src, `${tag}.sql`);
  if (!fs.existsSync(sqlPath)) continue;
  const query = fs.readFileSync(sqlPath, 'utf8');
  fs.writeFileSync(path.join(out, `${tag}.json`), JSON.stringify({ project_id, query, _batch: tag }));
}
console.log('built', fs.readdirSync(out).length, 'files in', out);

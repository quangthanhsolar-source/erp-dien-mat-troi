import fs from 'fs';
import path from 'path';

const dir = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'crm-b64-do');
const outDir = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'crm-decoded');
fs.mkdirSync(outDir, { recursive: true });
const pid = 'ceiuwiamqszmxmqtbemy';

function extractSql(doLine) {
  const start = doLine.indexOf("decode('") + 8;
  const end = doLine.lastIndexOf("', 'base64')");
  if (start < 8 || end < 0) throw new Error('decode block not found');
  const b64 = doLine.slice(start, end);
  return Buffer.from(b64, 'base64').toString('utf8');
}

for (let i = 0; i <= 30; i++) {
  const tag = String(i).padStart(2, '0');
  const doLine = fs.readFileSync(path.join(dir, `d${tag}.sql`), 'utf8');
  const sql = extractSql(doLine);
  fs.writeFileSync(path.join(outDir, `d${tag}.sql`), sql);
  fs.writeFileSync(
    path.join(outDir, `mcp-d${tag}.json`),
    JSON.stringify({ project_id: pid, query: sql })
  );
  console.log(tag, sql.length);
}

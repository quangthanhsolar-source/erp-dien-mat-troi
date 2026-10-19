import fs from 'fs';
import path from 'path';

const chunkDir = 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\crm-tiny-chunks';
const outDir = 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const names = ['chunk00', 'chunk01', 'chunk02', 'chunk03', 'chunk04', 'chunk05'];

for (const c of names) {
  const q = fs.readFileSync(path.join(chunkDir, `${c}.sql`), 'utf8');
  const b64 = Buffer.from(q, 'utf8').toString('base64');
  const sql = `DO $do$ BEGIN EXECUTE convert_from(decode('${b64}', 'base64'), 'UTF8'); END $do$;`;
  fs.writeFileSync(path.join(outDir, `${c}-do.sql`), sql, 'utf8');
  fs.writeFileSync(
    path.join(outDir, `mcp-${c}-do.json`),
    JSON.stringify({ project_id: 'ceiuwiamqszmxmqtbemy', query: sql })
  );
  console.log(c, sql.length);
}

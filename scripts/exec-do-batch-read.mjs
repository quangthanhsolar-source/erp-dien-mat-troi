/** Read exec-dXX.json and write plain .sql for agent MCP (query only). */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const tags = process.argv.slice(2).map((t) => String(t).padStart(2, '0'));
for (const tag of tags) {
  const j = JSON.parse(fs.readFileSync(path.join(tmp, `exec-d${tag}.json`), 'utf8'));
  const out = path.join(tmp, `_exec-d${tag}.sql`);
  fs.writeFileSync(out, j.query, 'utf8');
  console.log(tag, j.query.length, out);
}

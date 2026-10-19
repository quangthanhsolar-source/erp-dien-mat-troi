import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
for (const tag of process.argv.slice(2)) {
  let fp;
  if (/^\d{3}$/.test(tag)) fp = path.join(cursor, `_pay-${tag}.json`);
  else if (/^t\d{3}$/.test(tag)) {
    const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
    fp = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
  } else {
    console.error('bad tag', tag);
    process.exit(1);
  }
  const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const out = path.join(cursor, `_query-${tag}.sql`);
  fs.writeFileSync(out, j.query, 'utf8');
  console.log(tag, j.query.length, out);
}

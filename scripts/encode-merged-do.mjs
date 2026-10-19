import fs from 'fs';
import path from 'path';

const merged = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'merged-decoded');
const out = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'merged-decoded-do');
fs.mkdirSync(out, { recursive: true });

for (let b = 0; b < 8; b++) {
  const sql = fs.readFileSync(path.join(merged, `batch${b}.sql`), 'utf8');
  const b64 = Buffer.from(sql, 'utf8').toString('base64');
  const doSql = `DO $$ DECLARE q text; BEGIN q := convert_from(decode('${b64}', 'base64'), 'UTF8'); EXECUTE q; END $$;`;
  fs.writeFileSync(path.join(out, `batch${b}.sql`), doSql, 'utf8');
  console.log(`batch${b}`, doSql.length);
}

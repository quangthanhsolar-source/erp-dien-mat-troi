import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\crm-tiny';
const out = 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\crm-tiny-remaining.sql';
const start = parseInt(process.argv[2] ?? '5', 10);
const end = parseInt(process.argv[3] ?? '122', 10);
const parts = [];
for (let i = start; i <= end; i++) {
  parts.push(fs.readFileSync(path.join(dir, `t${String(i).padStart(3, '0')}.sql`), 'utf8').trim());
}
fs.writeFileSync(out, parts.join('\n\n'), 'utf8');
console.log('bytes', fs.statSync(out).size, 'files', parts.length);

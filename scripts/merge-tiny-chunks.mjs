import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\crm-tiny';
const outDir = 'C:\\Users\\Administrator\\AppData\\Local\\Temp\\crm-tiny-chunks';
fs.mkdirSync(outDir, { recursive: true });
const start = 5;
const end = 122;
const chunkSize = 20;
let chunkIdx = 0;
for (let i = start; i <= end; i += chunkSize) {
  const parts = [];
  for (let j = i; j < i + chunkSize && j <= end; j++) {
    parts.push(fs.readFileSync(path.join(dir, `t${String(j).padStart(3, '0')}.sql`), 'utf8').trim());
  }
  const name = `chunk${String(chunkIdx).padStart(2, '0')}.sql`;
  const file = path.join(outDir, name);
  fs.writeFileSync(file, parts.join('\n\n'), 'utf8');
  console.log(name, fs.statSync(file).size, 't', i, '-', Math.min(i + chunkSize - 1, end));
  chunkIdx++;
}

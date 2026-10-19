import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const decoded = path.join(tmp, 'crm-decoded');
const out = path.join(tmp, 'mcp-args-all');
const tiny = path.join(tmp, 'tiny-mcp-args');
fs.mkdirSync(out, { recursive: true });

for (let i = 0; i <= 30; i++) {
  const tag = String(i).padStart(2, '0');
  fs.copyFileSync(path.join(decoded, `mcp-d${tag}.json`), path.join(out, `d${tag}.json`));
}
for (let n = 0; n <= 122; n++) {
  const tag = String(n).padStart(3, '0');
  const src = path.join(tiny, `t${tag}.json`);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(out, `t${tag}.json`));
}
console.log('prepared', out);

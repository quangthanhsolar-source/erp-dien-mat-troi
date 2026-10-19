import fs from 'fs';
import path from 'path';

const decoded = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'crm-decoded');
const outDir = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'mcp-out');
fs.mkdirSync(outDir, { recursive: true });
for (let i = 0; i <= 30; i++) {
  const tag = String(i).padStart(2, '0');
  fs.copyFileSync(path.join(decoded, `mcp-d${tag}.json`), path.join(outDir, `d${tag}.json`));
}
console.log('ready', outDir);

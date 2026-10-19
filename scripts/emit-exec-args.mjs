import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const tag = String(process.argv[2] ?? '01').padStart(2, '0');
const out = path.join(tmp, `mcp-args-d${tag}.json`);
const j = JSON.parse(fs.readFileSync(path.join(tmp, `exec-d${tag}.json`), 'utf8'));
fs.writeFileSync(out, JSON.stringify({ project_id: j.project_id, query: j.query }));
console.log(out);

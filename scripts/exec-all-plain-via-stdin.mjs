/**
 * Outputs one JSON line per file: {tag, project_id, query} for agent MCP batching.
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const project_id = 'ceiuwiamqszmxmqtbemy';
const start = parseInt(process.argv[2] || '0', 10);
const end = parseInt(process.argv[3] || '30', 10);

for (let i = start; i <= end; i++) {
  const tag = `d${String(i).padStart(2, '0')}`;
  const plain = path.join(tmp, `_plain-${tag}.sql`);
  const dob64 = path.join(tmp, 'crm-b64-do', `${tag}.sql`);
  let query;
  if (fs.existsSync(plain)) query = fs.readFileSync(plain, 'utf8');
  else if (fs.existsSync(dob64)) query = fs.readFileSync(dob64, 'utf8');
  else continue;
  process.stdout.write(JSON.stringify({ tag, project_id, query }) + '\n');
}

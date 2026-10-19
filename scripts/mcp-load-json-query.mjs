/** stdout: JSON {project_id, query} for one mcp-batch or merged file */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const kind = process.argv[2]; // plain-d00 | merged-0
const project_id = 'ceiuwiamqszmxmqtbemy';

let query;
if (kind.startsWith('plain-d')) {
  query = fs.readFileSync(path.join(tmp, `_${kind}.sql`), 'utf8');
} else if (kind.startsWith('merged-')) {
  const b = kind.replace('merged-', '');
  query = fs.readFileSync(path.join(tmp, `_merged-batch${b}.sql`), 'utf8');
} else if (kind.endsWith('.json')) {
  ({ query } = JSON.parse(fs.readFileSync(kind, 'utf8')));
} else {
  console.error('unknown kind', kind);
  process.exit(1);
}
process.stdout.write(JSON.stringify({ project_id, query }));

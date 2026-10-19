/** Print MCP execute_sql args JSON for one job. Usage: node crm-load-mcp-arg.mjs exec 014 | tiny t000 */
import fs from 'fs';
import path from 'path';

const [kind, tag] = process.argv.slice(2);
const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';

let fp;
if (kind === 'exec') {
  fp = path.join(cursor, `_mcp-exec-${tag}.json`);
} else if (kind === 'tiny') {
  fp = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
} else if (kind === 'tiny-sql') {
  const sql = fs.readFileSync(path.join(tmp, 'crm-tiny', `${tag}.sql`), 'utf8');
  process.stdout.write(JSON.stringify({ project_id: 'ceiuwiamqszmxmqtbemy', query: sql }));
  process.exit(0);
} else if (kind === 'b') {
  fp = path.join(tmp, 'crm-mcp-out', `${tag}.json`);
} else if (kind === 'd') {
  fp = path.join(tmp, `mcp-arg-${tag}.json`);
} else {
  console.error('kind: exec|tiny|tiny-sql|b|d');
  process.exit(1);
}

const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
process.stdout.write(JSON.stringify({ project_id: j.project_id, query: j.query }));

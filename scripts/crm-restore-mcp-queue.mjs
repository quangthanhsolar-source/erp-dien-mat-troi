/**
 * Prints ordered MCP job list for CRM restore (agent runs execute_sql 5-wide).
 * Jobs: runs 014-026, tinies t000-t122, gap-fill b00-b30 + d00-d30 if needed.
 */
import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const crmOut = path.join(tmp, 'crm-mcp-out');

const jobs = [];

for (let i = 14; i <= 26; i++) {
  const tag = String(i).padStart(3, '0');
  const fp = path.join(cursor, `_run-${tag}.json`);
  if (fs.existsSync(fp)) jobs.push({ kind: 'run', tag, path: fp });
}

for (let i = 0; i <= 122; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const fp = path.join(tmp, 'crm-tiny', `${tag}.sql`);
  if (fs.existsSync(fp)) jobs.push({ kind: 'tiny', tag, path: fp, sql: true });
}

for (let i = 0; i <= 30; i++) {
  const tag = `b${String(i).padStart(2, '0')}`;
  const fp = path.join(crmOut, `${tag}.json`);
  if (fs.existsSync(fp)) jobs.push({ kind: 'b64-b', tag, path: fp });
}
for (let i = 0; i <= 30; i++) {
  const tag = `d${String(i).padStart(2, '0')}`;
  const fp = path.join(tmp, `mcp-arg-${tag}.json`);
  if (fs.existsSync(fp)) jobs.push({ kind: 'b64-d', tag, path: fp });
}

console.log(JSON.stringify({ project_id: 'ceiuwiamqszmxmqtbemy', total: jobs.length, jobs }, null, 0));

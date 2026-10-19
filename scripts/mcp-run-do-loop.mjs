/**
 * Progress tracker for DO restore via Supabase MCP execute_sql.
 * Agent: for each tag not in mcp-done.txt, load mcp-query-{tag}.json and call execute_sql (4 parallel).
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const donePath = path.join(tmp, 'mcp-done.txt');
const done = new Set(
  fs.existsSync(donePath) ? fs.readFileSync(donePath, 'utf8').trim().split(/\s+/).filter(Boolean) : []
);

const pending = [];
for (let i = 0; i <= 30; i++) {
  const tag = `d${String(i).padStart(2, '0')}`;
  if (!done.has(tag)) pending.push(tag);
}

const batch = pending.slice(0, 4);
for (const tag of batch) {
  const jpath = path.join(tmp, `mcp-query-${tag}.json`);
  if (!fs.existsSync(jpath)) {
    const sql = path.join(tmp, 'crm-b64-do', `${tag}.sql`);
    if (fs.existsSync(sql)) {
      fs.writeFileSync(jpath, JSON.stringify({ project_id: 'ceiuwiamqszmxmqtbemy', query: fs.readFileSync(sql, 'utf8') }));
    }
  }
  console.log(tag, fs.existsSync(jpath) ? 'ready' : 'MISSING');
}
console.log(JSON.stringify({ pending: pending.length, next: batch }));

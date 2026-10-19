/**
 * Apply one wave of SQL files via Supabase MCP using Cursor's dynamic tool bridge.
 * Requires: node 20+, runs in repo root.
 *
 * Usage: node scripts/crm-mcp-apply-batch.mjs 014 015 016 017 018
 *
 * This script uses child_process to invoke `cursor` MCP if unavailable it prints
 * payloads to .cursor/_batch-apply.json for manual agent apply.
 */
import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
const tags = process.argv.slice(2);
const payloads = tags.map((tag) => {
  const sqlPath = path.join(cursor, `_query-${tag}.sql`);
  const payPath = path.join(cursor, `_pay-${tag}.json`);
  let query, project_id = 'ceiuwiamqszmxmqtbemy';
  if (fs.existsSync(sqlPath)) query = fs.readFileSync(sqlPath, 'utf8');
  else if (fs.existsSync(payPath)) {
    const j = JSON.parse(fs.readFileSync(payPath, 'utf8'));
    query = j.query;
    project_id = j.project_id;
  } else throw new Error('missing ' + tag);
  return { tag, project_id, query };
});

const out = path.join(cursor, '_batch-apply.json');
fs.writeFileSync(out, JSON.stringify(payloads, null, 0), 'utf8');
console.log(JSON.stringify({ count: payloads.length, out, tags }));

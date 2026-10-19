/**
 * Read SQL/JSON payload and print MCP execute_sql args as one JSON line (UTF-8).
 * Agent: node crm-mcp-exec-sql.mjs .cursor/_query-014.sql ceiuwiamqszmxmqtbemy
 *        node crm-mcp-exec-sql.mjs .cursor/_pay-014.json
 */
import fs from 'fs';
import path from 'path';

const fp = process.argv[2];
const projectId = process.argv[3] || 'ceiuwiamqszmxmqtbemy';
if (!fp) {
  console.error('usage: node crm-mcp-exec-sql.mjs <file> [project_id]');
  process.exit(1);
}
const abs = path.isAbsolute(fp) ? fp : path.join(process.cwd(), fp);
let query;
let pid = projectId;
if (fp.endsWith('.sql')) {
  query = fs.readFileSync(abs, 'utf8');
} else {
  const j = JSON.parse(fs.readFileSync(abs, 'utf8'));
  query = j.query;
  pid = j.project_id || projectId;
}
process.stdout.write(JSON.stringify({ project_id: pid, query }));

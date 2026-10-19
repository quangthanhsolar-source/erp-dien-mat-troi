/**
 * Prints one JSON line { project_id, query, _file } for agent MCP execute_sql.
 * Usage: node crm-mcp-exec-sql-file.mjs path/to/file.sql
 */
import fs from 'fs';

const file = process.argv[2];
const out = process.argv[3];
if (!file) {
  console.error('usage: node crm-mcp-exec-sql-file.mjs <sql-file> [out.json]');
  process.exit(1);
}
const query = fs.readFileSync(file, 'utf8');
const payload = JSON.stringify({
  project_id: 'ceiuwiamqszmxmqtbemy',
  query,
  _file: file.replace(/\\/g, '/').split('/').pop(),
});
if (out) fs.writeFileSync(out, payload, 'utf8');
else process.stdout.write(payload);

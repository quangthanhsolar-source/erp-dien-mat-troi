/**
 * Reads JSON MCP payloads and prints one JSON line per file for agent execute_sql.
 * Usage: node crm-run-mcp-json-batch.mjs path1 path2 ...
 */
import fs from 'fs';

for (const p of process.argv.slice(2)) {
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  process.stdout.write(JSON.stringify({ file: p, project_id: j.project_id, query: j.query }) + '\n');
}

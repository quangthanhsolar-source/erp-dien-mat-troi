/**
 * Reads {project_id, query} JSON and prints query length + OK marker.
 * Agent must CallDynamicTool execute_sql with the same file contents.
 * Usage: node crm-mcp-exec-file.mjs .cursor/_payload-002.json
 */
import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node crm-mcp-exec-file.mjs <json-path>');
  process.exit(1);
}
const j = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!j.project_id || !j.query) {
  console.error('missing project_id or query');
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, file, project_id: j.project_id, queryLen: j.query.length }));

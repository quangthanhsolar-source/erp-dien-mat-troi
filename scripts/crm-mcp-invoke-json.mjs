/**
 * Prints instructions + query length for agent MCP execute_sql.
 * Usage: node crm-mcp-invoke-json.mjs <path-to-{project_id,query}.json>
 */
import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node crm-mcp-invoke-json.mjs <json-path>');
  process.exit(1);
}
const j = JSON.parse(fs.readFileSync(file, 'utf8'));
console.log(JSON.stringify({ project_id: j.project_id, queryLen: j.query?.length, file }));

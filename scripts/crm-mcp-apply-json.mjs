/**
 * Reads {project_id, query} JSON and prints MCP apply instruction.
 * Agent: CallDynamicTool execute_sql with parsed JSON (do not truncate query).
 * Usage: node crm-mcp-apply-json.mjs <path-to-json>
 */
import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node crm-mcp-apply-json.mjs <json-path>');
  process.exit(1);
}
const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!payload.project_id || !payload.query) {
  console.error('missing project_id or query in', file);
  process.exit(1);
}
// Single line JSON for agent to pass to execute_sql
process.stdout.write(JSON.stringify(payload));

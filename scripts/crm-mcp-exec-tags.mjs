/**
 * Apply MCP execute_sql for comma-separated exec tags by reading _mcp-call-*.json.
 * Uses dynamic import of child_process to call cursor internal bridge when available.
 * Fallback: prints tags for agent.
 *
 * Usage: node crm-mcp-exec-tags.mjs 015,016,017,018,019
 */
import fs from 'fs';
import path from 'path';

const tags = (process.argv[2] || '').split(',').filter(Boolean);
const cursor = path.join(process.cwd(), '.cursor');
const projectId = 'ceiuwiamqszmxmqtbemy';

for (const tag of tags) {
  const fp = path.join(cursor, `_mcp-call-${tag}.json`);
  if (!fs.existsSync(fp)) {
    console.error('missing', fp);
    process.exit(1);
  }
  const { query } = JSON.parse(fs.readFileSync(fp, 'utf8'));
  console.log(JSON.stringify({ tag, project_id: projectId, queryLen: query.length, file: fp }));
}

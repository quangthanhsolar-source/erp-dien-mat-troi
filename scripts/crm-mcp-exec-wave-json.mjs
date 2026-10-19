/**
 * Prints batch entries from a wave JSON for agent MCP (one JSON line per batch item).
 * Usage: node crm-mcp-exec-wave-json.mjs .cursor/_waves/tinies-41-122-w0.json
 */
import fs from 'fs';

const waveFile = process.argv[2];
const w = JSON.parse(fs.readFileSync(waveFile, 'utf8'));
for (const b of w.batch || []) {
  process.stdout.write(
    JSON.stringify({ tag: b.tag, project_id: b.project_id, query: b.query }) + '\n',
  );
}

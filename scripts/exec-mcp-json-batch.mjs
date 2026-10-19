/**
 * Reads mcp-args JSON files and prints one JSON object per line for agent/MCP batching.
 * Usage: node exec-mcp-json-batch.mjs d00 d01 d02
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
for (const tag of process.argv.slice(2)) {
  const t = tag.replace(/^d/, '').padStart(2, '0');
  const p = path.join(tmp, `mcp-args-d${t}.json`);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  process.stdout.write(JSON.stringify(j) + '\n');
}

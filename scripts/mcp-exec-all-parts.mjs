/**
 * Agent helper: list MCP JSON payloads for bulk CRM restore.
 * Usage: node mcp-exec-all-parts.mjs [startIndex] [count]
 * Files: .cursor/_mcp-part-NNN.json (27 parts, batches 1-7)
 * Also lists tiny t021-t122 from %TEMP%/tiny-mcp-args
 */
import fs from 'fs';
import path from 'path';

const cursorDir = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const start = parseInt(process.argv[2] ?? '0', 10);
const count = parseInt(process.argv[3] ?? '5', 10);

const parts = fs
  .readdirSync(cursorDir)
  .filter((f) => /^_mcp-part-\d+\.json$/.test(f))
  .sort();

const slice = parts.slice(start, start + count);
for (const f of slice) {
  const j = JSON.parse(fs.readFileSync(path.join(cursorDir, f), 'utf8'));
  console.log(JSON.stringify({ file: f, qlen: j.query.length }));
}
console.log(JSON.stringify({ totalParts: parts.length, nextStart: start + slice.length }));

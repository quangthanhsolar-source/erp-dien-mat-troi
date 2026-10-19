/** Dump combo MCP JSON query to .cursor/_mcp-queue/<name>.sql */
import fs from 'fs';
import path from 'path';

const names = process.argv.slice(2);
if (!names.length) {
  console.error('usage: node crm-dump-combo-batch.mjs _mcp-call-combo-002-005.json ...');
  process.exit(1);
}
const outDir = path.join(process.cwd(), '.cursor', '_mcp-queue');
fs.mkdirSync(outDir, { recursive: true });
const written = [];
for (const name of names) {
  const src = path.join(process.cwd(), '.cursor', name);
  const j = JSON.parse(fs.readFileSync(src, 'utf8'));
  const base = name.replace(/\.json$/, '');
  fs.writeFileSync(path.join(outDir, `${base}.sql`), j.query, 'utf8');
  written.push({ name, len: j.query.length });
}
console.log(JSON.stringify({ written, outDir }));

/**
 * Split multi-statement MCP query JSON into smaller JSON files.
 * Usage: node crm-split-mcp-query.mjs .cursor/_wave-chunk111.json
 */
import fs from 'fs';
import path from 'path';

const file = process.argv[2];
if (!file) {
  console.error('usage: node crm-split-mcp-query.mjs <json-path>');
  process.exit(1);
}
const { project_id, query } = JSON.parse(fs.readFileSync(file, 'utf8'));
const re = /;\n(?=insert into public\.crm_leads)/gi;
const parts = query.split(re).map((s, i, arr) => (i < arr.length - 1 ? `${s};` : s)).map((s) => s.trim()).filter(Boolean);
const outDir = path.join(path.dirname(file), '_split-chunk');
fs.mkdirSync(outDir, { recursive: true });
const base = path.basename(file, '.json');
parts.forEach((p, i) => {
  const out = path.join(outDir, `${base}-p${String(i).padStart(2, '0')}.json`);
  fs.writeFileSync(out, JSON.stringify({ project_id, query: p }));
});
console.log(JSON.stringify({ file, parts: parts.length, lens: parts.map((p) => p.length) }));

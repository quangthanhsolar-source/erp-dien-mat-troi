import fs from 'fs';
import path from 'path';

const src = process.argv[2];
const dest = process.argv[3];
if (!src || !dest) {
  console.error('usage: node write-mcp-arg-file.mjs <src.json> <dest.json>');
  process.exit(1);
}
const j = JSON.parse(fs.readFileSync(src, 'utf8'));
fs.writeFileSync(dest, JSON.stringify(j), 'utf8');
console.log(dest, JSON.stringify(j).length);

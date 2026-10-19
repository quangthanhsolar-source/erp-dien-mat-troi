import fs from 'fs';
import path from 'path';

const tag = process.argv[2];
if (!tag) {
  console.error('usage: node crm-extract-tiny-query.mjs t016');
  process.exit(1);
}
const dir = path.join(process.env.TEMP || '', 'tiny-mcp-args');
const file = path.join(dir, `${tag}.json`);
const j = JSON.parse(fs.readFileSync(file, 'utf8'));
process.stdout.write(JSON.stringify({ project_id: j.project_id, query: j.query }));

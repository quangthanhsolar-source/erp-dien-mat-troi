import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
const tags = process.argv.slice(2);
for (const tag of tags) {
  const src = path.join(cursor, `_pay-${tag}.json`);
  const j = JSON.parse(fs.readFileSync(src, 'utf8'));
  const out = path.join(cursor, `_mcp-call-${tag}.json`);
  fs.writeFileSync(out, JSON.stringify({ project_id: j.project_id, query: j.query }), 'utf8');
  console.log(tag, j.query.length, out);
}

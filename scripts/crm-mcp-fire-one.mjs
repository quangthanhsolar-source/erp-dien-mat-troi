/** Print {project_id, query} for one _mcp-call-*.json or _pay-*.json (stdout, UTF-8) */
import fs from 'fs';
import path from 'path';
const tag = process.argv[2];
const cursor = path.join(process.cwd(), '.cursor');
const candidates = [
  path.join(cursor, `_mcp-call-${tag}.json`),
  path.join(cursor, `_pay-${tag}.json`),
];
const fp = candidates.find((f) => fs.existsSync(f));
if (!fp) {
  console.error('not found', tag);
  process.exit(1);
}
const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
process.stdout.write(JSON.stringify({ project_id: j.project_id, query: j.query }));

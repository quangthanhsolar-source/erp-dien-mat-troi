/** Dump N tiny JSON files to .cursor/_mcp-queue/<tag>.sql (raw query UTF-8). */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const dir = path.join(tmp, 'tiny-mcp-args');
const outDir = path.join(process.cwd(), '.cursor', '_mcp-queue');
const start = parseInt(process.argv[2] || '51', 10);
const count = parseInt(process.argv[3] || '5', 10);

fs.mkdirSync(outDir, { recursive: true });
const tags = [];
for (let i = start; i < start + count && i <= 122; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const src = path.join(dir, `${tag}.json`);
  if (!fs.existsSync(src)) {
    console.error('missing', src);
    process.exit(1);
  }
  const j = JSON.parse(fs.readFileSync(src, 'utf8'));
  fs.writeFileSync(path.join(outDir, `${tag}.sql`), j.query, 'utf8');
  tags.push(tag);
}
console.log(JSON.stringify({ tags, outDir }));

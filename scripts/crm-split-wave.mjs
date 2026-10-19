import fs from 'fs';
import path from 'path';

const waveFile = process.argv[2];
const w = JSON.parse(fs.readFileSync(waveFile, 'utf8'));
const outDir = path.join(process.cwd(), '.cursor', '_singles');
fs.mkdirSync(outDir, { recursive: true });
for (const b of w.batch || []) {
  const fp = path.join(outDir, `${b.tag}.json`);
  fs.writeFileSync(fp, JSON.stringify({ project_id: b.project_id, query: b.query }));
  console.log(fp);
}

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const waveScript = path.join(process.cwd(), 'scripts', 'crm-mcp-wave.mjs');
const outDir = path.join(process.cwd(), '.cursor', '_waves');
fs.mkdirSync(outDir, { recursive: true });

const [kind, a, b, waveStr] = process.argv.slice(2);
const out = path.join(outDir, `${kind}-${a}-${b}-w${waveStr || '0'}.json`);
const r = spawnSync(process.execPath, [waveScript, kind, a, b, waveStr || '0'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(r.status || 1);
}
fs.writeFileSync(out, r.stdout.trim());
const j = JSON.parse(r.stdout);
console.log(JSON.stringify({ out, tags: j.batch?.map((x) => x.tag) || [], done: j.done }));

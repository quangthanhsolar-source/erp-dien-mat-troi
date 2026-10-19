/**
 * Prepare + print one 5-wide wave for agent MCP apply.
 * Usage:
 *   node crm-mcp-run-wave.mjs exec 14 26 1   -> wave index 1 (tags 019-023)
 *   node crm-mcp-run-wave.mjs tiny 0 122 2
 * Writes .cursor/_wave-tags.json with [{tag, file}]
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const [kind, a, b, w] = process.argv.slice(2);
const waveScript = path.join(process.cwd(), 'scripts', 'crm-mcp-apply-wave.mjs');
const r = spawnSync(process.execPath, [waveScript, kind, a, b, w ?? '0'], { encoding: 'utf8' });
const meta = JSON.parse(r.stdout.trim());
const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';

if (meta.done) {
  console.log(JSON.stringify({ done: true, kind, a, b }));
  process.exit(0);
}

const tags = meta.tags || [];
const files = tags.map((tag) => {
  if (/^\d{3}$/.test(tag)) return { tag, file: path.join(cursor, `_mcp-call-${tag}.json`) };
  if (/^t\d{3}$/.test(tag)) return { tag, file: path.join(tmp, 'tiny-mcp-args', `${tag}.json`) };
  if (/^b\d{2}$/.test(tag)) return { tag, file: path.join(tmp, 'crm-mcp-out', `${tag}.json`) };
  if (/^d\d{2}$/.test(tag)) return { tag, file: path.join(tmp, `mcp-arg-${tag}.json`) };
  return { tag, file: null };
});

const out = path.join(cursor, '_wave-tags.json');
fs.writeFileSync(out, JSON.stringify({ kind, wave: meta.wave, files }, null, 2));
console.log(JSON.stringify({ ...meta, waveTagsFile: out }));

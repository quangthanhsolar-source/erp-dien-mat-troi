/**
 * Reads .cursor/_mcp-call-*.json or pay files and writes agent instruction file
 * with base64-encoded queries to avoid console encoding issues.
 * Agent decodes and calls execute_sql (5 parallel per wave).
 *
 * Usage: node crm-mcp-invoke-wave.mjs exec 14 26 0
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const waveScript = path.join(process.cwd(), 'scripts', 'crm-mcp-apply-wave.mjs');
const [kind, a, b, w] = process.argv.slice(2);
const r = spawnSync(process.execPath, [waveScript, kind, a, b, w ?? '0'], { encoding: 'utf8' });
if (r.status !== 0) {
  console.error(r.stderr);
  process.exit(1);
}
const meta = JSON.parse(r.stdout.trim());
if (meta.done) {
  console.log(JSON.stringify({ done: true }));
  process.exit(0);
}

const cursor = path.join(process.cwd(), '.cursor');
const payloads = [];
for (const tag of meta.tags) {
  let file;
  if (kind === 'exec') file = path.join(cursor, `_pay-${tag}.json`);
  else if (kind === 'tiny') {
    const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
    file = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
  } else if (kind === 'gap-b') {
    const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
    file = path.join(tmp, 'crm-mcp-out', `${tag}.json`);
  } else if (kind === 'gap-d') {
    const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
    file = path.join(tmp, `mcp-arg-${tag}.json`);
  }
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  payloads.push({
    tag,
    project_id: j.project_id || 'ceiuwiamqszmxmqtbemy',
    query: j.query,
  });
}

const out = path.join(cursor, '_mcp-wave-payloads.json');
fs.writeFileSync(out, JSON.stringify({ wave: meta.wave, kind, payloads }, null, 0), 'utf8');
console.log(JSON.stringify({ ...meta, payloadsFile: out, sizes: payloads.map((p) => [p.tag, p.query.length]) }));

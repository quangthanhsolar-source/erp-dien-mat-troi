/**
 * Apply one wave (5 jobs) via Supabase MCP execute_sql using Cursor agent subprocess.
 * Reads payload files and writes .cursor/_mcp-wave-result.json with per-job status.
 *
 * This script ONLY prepares the wave manifest; the agent must call execute_sql.
 * Usage: node crm-mcp-apply-wave.mjs exec 14 26 0
 */
import fs from 'fs';
import path from 'path';

const [kind, a, b, w] = process.argv.slice(2);
const wave = parseInt(w || '0', 10);
const start = parseInt(a, 10);
const end = parseInt(b, 10);
const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const batchSize = 5;

const jobs = [];
if (kind === 'exec') {
  for (let i = start; i <= end; i++) {
    const tag = String(i).padStart(3, '0');
    jobs.push({ tag, file: path.join(cursor, `_pay-${tag}.json`) });
  }
} else if (kind === 'tiny') {
  for (let i = start; i <= end; i++) {
    const tag = `t${String(i).padStart(3, '0')}`;
    jobs.push({ tag, file: path.join(tmp, 'tiny-mcp-args', `${tag}.json`) });
  }
} else if (kind === 'gap-b') {
  for (let i = start; i <= end; i++) {
    const tag = `b${String(i).padStart(2, '0')}`;
    jobs.push({ tag, file: path.join(tmp, 'crm-mcp-out', `${tag}.json`) });
  }
} else if (kind === 'gap-d') {
  for (let i = start; i <= end; i++) {
    const tag = `d${String(i).padStart(2, '0')}`;
    jobs.push({ tag, file: path.join(tmp, `mcp-arg-${tag}.json`) });
  }
} else {
  console.error('kind: exec|tiny|gap-b|gap-d');
  process.exit(1);
}

const slice = jobs.filter((j) => fs.existsSync(j.file)).slice(wave * batchSize, (wave + 1) * batchSize);
if (!slice.length) {
  console.log(JSON.stringify({ done: true, total: jobs.length }));
  process.exit(0);
}

const payloads = slice.map(({ tag, file }) => {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { tag, project_id: j.project_id, query: j.query, queryLen: j.query.length };
});

const out = path.join(cursor, '_mcp-wave-manifest.json');
fs.writeFileSync(out, JSON.stringify({ wave, kind, payloads }, null, 0));
console.log(JSON.stringify({ wave, count: payloads.length, tags: payloads.map((p) => p.tag), manifest: out }));

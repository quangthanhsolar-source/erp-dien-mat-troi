/**
 * Emit wave manifest for agent MCP restore (5 jobs per wave).
 * Usage:
 *   node crm-mcp-wave-runner.mjs exec 14 26 0
 *   node crm-mcp-wave-runner.mjs tiny 5 122 0
 */
import fs from 'fs';
import path from 'path';

const [kind, startStr, endStr, waveStr] = process.argv.slice(2);
const start = parseInt(startStr, 10);
const end = parseInt(endStr, 10);
const wave = parseInt(waveStr || '0', 10);
const batchSize = 5;
const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';

const jobs = [];
if (kind === 'exec') {
  for (let i = start; i <= end; i++) {
    const tag = String(i).padStart(3, '0');
    jobs.push({ tag, path: path.join(cursor, `_q-${tag}.txt`), kind: 'exec' });
  }
} else if (kind === 'tiny') {
  for (let i = start; i <= end; i++) {
    const tag = `t${String(i).padStart(3, '0')}`;
    const fp = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
    if (fs.existsSync(fp)) jobs.push({ tag, path: fp, kind: 'tiny' });
  }
} else {
  console.error('kind exec|tiny');
  process.exit(1);
}

const slice = jobs.slice(wave * batchSize, (wave + 1) * batchSize);
if (!slice.length) {
  console.log(JSON.stringify({ done: true, total: jobs.length }));
  process.exit(0);
}
console.log(JSON.stringify({ wave, total: jobs.length, jobs: slice }, null, 0));

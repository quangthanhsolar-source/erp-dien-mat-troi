/**
 * CRM restore helper: emit next N MCP payload paths (parts + tinies).
 * Agent: Read each JSON → CallDynamicTool execute_sql with parsed {project_id, query}.
 *
 * Usage:
 *   node crm-next-mcp-batch.mjs parts 5
 *   node crm-next-mcp-batch.mjs tinies 5 26
 *   node crm-next-mcp-batch.mjs mark part 000
 *   node crm-next-mcp-batch.mjs mark tiny t026
 */
import fs from 'fs';
import path from 'path';

const cursorDir = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const progressPath = path.join(cursorDir, '_crm-restore-progress.json');

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  } catch {
    return { parts: [], tinies: [] };
  }
}

function saveProgress(p) {
  fs.writeFileSync(progressPath, JSON.stringify(p, null, 2) + '\n');
}

const [cmd, kind, ...rest] = process.argv.slice(2);

if (cmd === 'mark') {
  const p = loadProgress();
  const tag = rest[0];
  if (kind === 'part') p.parts.push(tag);
  else if (kind === 'tiny') p.tinies.push(tag);
  p.parts = [...new Set(p.parts)].sort();
  p.tinies = [...new Set(p.tinies)].sort();
  saveProgress(p);
  console.log('marked', kind, tag);
  process.exit(0);
}

const count = parseInt(rest[0] || '5', 10);
const p = loadProgress();
const doneParts = new Set(p.parts);
const doneTinies = new Set(p.tinies);

if (kind === 'parts') {
  const all = fs
    .readdirSync(cursorDir)
    .filter((f) => /^_mcp-part-\d+\.json$/.test(f))
    .sort();
  const pending = all.filter((f) => !doneParts.has(f.replace('_mcp-part-', '').replace('.json', '')));
  const batch = pending.slice(0, count).map((f) => path.join(cursorDir, f));
  console.log(JSON.stringify({ pending: pending.length, batch }, null, 2));
} else if (kind === 'tinies') {
  const start = parseInt(rest[1] || '11', 10);
  const end = parseInt(rest[2] || '122', 10);
  const batch = [];
  for (let i = start; i <= end; i++) {
    const tag = `t${String(i).padStart(3, '0')}`;
    if (doneTinies.has(tag)) continue;
    const src = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
    if (fs.existsSync(src)) batch.push(src);
    if (batch.length >= count) break;
  }
  console.log(JSON.stringify({ batch }, null, 2));
} else {
  console.error('usage: parts|tinies|mark');
  process.exit(1);
}

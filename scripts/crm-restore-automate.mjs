/**
 * CRM restore wave planner (MCP-only env).
 * Writes .cursor/_waves/*.json for agent execute_sql (5 parallel).
 *
 * Usage:
 *   node crm-restore-automate.mjs plan-combos
 *   node crm-restore-automate.mjs plan-parts 2 26
 *   node crm-restore-automate.mjs plan-tinies 36 122
 *   node crm-restore-automate.mjs mark-done tiny t031
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cursor = path.join(process.cwd(), '.cursor');
const wavesDir = path.join(cursor, '_waves');
const progressPath = path.join(cursor, '_crm-restore-progress.json');
const waveScript = path.join(process.cwd(), 'scripts', 'crm-mcp-wave.mjs');

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  } catch {
    return { parts: [], tinies: [], combos: [] };
  }
}

function saveProgress(p) {
  fs.writeFileSync(progressPath, JSON.stringify(p, null, 2) + '\n');
}

function writeWave(name, kind, a, b, waveIndex) {
  fs.mkdirSync(wavesDir, { recursive: true });
  const out = path.join(wavesDir, `${name}-w${waveIndex}.json`);
  const r = spawnSync(process.execPath, [waveScript, kind, String(a), String(b), String(waveIndex)], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    return null;
  }
  const j = JSON.parse(r.stdout);
  if (j.done) return null;
  fs.writeFileSync(out, r.stdout.trim());
  return { out, tags: j.batch.map((x) => x.tag) };
}

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === 'mark-done') {
  const [kind, tag] = rest;
  const p = loadProgress();
  if (kind === 'part') p.parts.push(tag);
  else if (kind === 'tiny') p.tinies.push(tag);
  else if (kind === 'combo') p.combos.push(tag);
  p.parts = [...new Set(p.parts)].sort();
  p.tinies = [...new Set(p.tinies)].sort();
  p.combos = [...new Set(p.combos || [])].sort();
  saveProgress(p);
  console.log('marked', kind, tag);
  process.exit(0);
}

if (cmd === 'plan-combos') {
  const planned = [];
  for (let w = 0; w < 2; w++) {
    const r = writeWave('combo', 'combo', 0, 0, w);
    if (r) planned.push(r);
  }
  console.log(JSON.stringify({ planned }, null, 2));
  process.exit(0);
}

if (cmd === 'plan-parts') {
  const start = parseInt(rest[0], 10);
  const end = parseInt(rest[1], 10);
  const planned = [];
  for (let w = 0; ; w++) {
    const r = writeWave(`parts-${start}-${end}`, 'parts', start, end, w);
    if (!r) break;
    planned.push(r);
  }
  console.log(JSON.stringify({ planned }, null, 2));
  process.exit(0);
}

if (cmd === 'plan-tinies') {
  const start = parseInt(rest[0], 10);
  const end = parseInt(rest[1], 10);
  const planned = [];
  for (let w = 0; ; w++) {
    const r = writeWave(`tinies-${start}-${end}`, 'tinies', start, end, w);
    if (!r) break;
    planned.push(r);
  }
  console.log(JSON.stringify({ plannedCount: planned.length, first: planned[0], last: planned[planned.length - 1] }, null, 2));
  process.exit(0);
}

console.error('usage: plan-combos|plan-parts|plan-tinies|mark-done');
process.exit(1);

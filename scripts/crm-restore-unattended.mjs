/**
 * Prints next 5 MCP jobs for CRM restore (agent calls execute_sql).
 * Usage: node scripts/crm-restore-unattended.mjs
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const statePath = path.join(cursor, '_crm-restore-progress.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    return { exec: [], tiny: [], combo: [], gapB: [], gapD: [] };
  }
}

const p = load();
const jobs = [];

for (let i = 14; i <= 26; i++) {
  const tag = String(i).padStart(3, '0');
  const fp = path.join(cursor, `_mcp-call-${tag}.json`);
  if (fs.existsSync(fp) && !p.exec.includes(tag)) jobs.push({ kind: 'exec', tag, file: fp });
}

for (let i = 0; i <= 122; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const fp = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
  if (fs.existsSync(fp) && !p.tiny.includes(tag)) jobs.push({ kind: 'tiny', tag, file: fp });
}

for (const c of ['014-017', '018-021', '022-026']) {
  const tag = `combo-${c}`;
  const fp = path.join(cursor, `_mcp-call-combo-${c}.json`);
  if (fs.existsSync(fp) && !(p.combo || []).includes(tag)) jobs.push({ kind: 'combo', tag, file: fp });
}

const next = jobs.slice(0, 5);
console.log(JSON.stringify({ pending: jobs.length, next, target: 1220 }, null, 0));

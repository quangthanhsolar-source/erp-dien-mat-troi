/**
 * Orchestrator: for each pending job, prints JSON line {tag, file} for agent MCP.
 * Agent should loop: read file -> execute_sql until count >= target.
 * Usage: node crm-mcp-run-all.mjs --count-only
 *        node crm-mcp-run-all.mjs --next 5
 */
import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const statePath = path.join(process.cwd(), 'scripts', 'crm-restore-queue.json');

const defaultState = {
  execTags: Array.from({ length: 13 }, (_, i) => String(14 + i).padStart(3, '0')),
  tinyTags: Array.from({ length: 123 }, (_, i) => `t${String(i).padStart(3, '0')}`),
  bTags: Array.from({ length: 31 }, (_, i) => `b${String(i).padStart(2, '0')}`),
  dTags: Array.from({ length: 31 }, (_, i) => `d${String(i).padStart(2, '0')}`),
  done: [],
};

function loadState() {
  if (!fs.existsSync(statePath)) {
    fs.writeFileSync(statePath, JSON.stringify(defaultState, null, 2));
    return { ...defaultState, done: [] };
  }
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function saveState(s) {
  fs.writeFileSync(statePath, JSON.stringify(s, null, 2) + '\n');
}

function resolveJob(tag) {
  if (/^\d{3}$/.test(tag)) {
    const pay = path.join(cursor, `_pay-${tag}.json`);
    const exec = path.join(cursor, `_mcp-exec-${tag}.json`);
    if (fs.existsSync(pay)) return { tag, kind: 'exec', file: pay };
    if (fs.existsSync(exec)) return { tag, kind: 'exec', file: exec };
    return null;
  }
  if (/^t\d{3}$/.test(tag)) {
    const f = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
    return fs.existsSync(f) ? { tag, kind: 'tiny', file: f } : null;
  }
  if (/^b\d{2}$/.test(tag)) {
    const f = path.join(tmp, 'crm-mcp-out', `${tag}.json`);
    return fs.existsSync(f) ? { tag, kind: 'b', file: f } : null;
  }
  if (/^d\d{2}$/.test(tag)) {
    const f = path.join(tmp, `mcp-arg-${tag}.json`);
    return fs.existsSync(f) ? { tag, kind: 'd', file: f } : null;
  }
  return null;
}

const args = process.argv.slice(2);
const state = loadState();
const queue = [...state.execTags, ...state.tinyTags, ...state.bTags, ...state.dTags];
const pending = queue.filter((t) => !state.done.includes(t));

if (args.includes('--stats')) {
  console.log(JSON.stringify({ pending: pending.length, done: state.done.length }));
  process.exit(0);
}

const n = parseInt(args[args.indexOf('--next') + 1] || '5', 10);
const batch = pending.slice(0, n).map(resolveJob).filter(Boolean);
console.log(JSON.stringify({ batch, remaining: pending.length - batch.length }));

if (args.includes('--mark-done')) {
  const tags = batch.map((b) => b.tag);
  state.done.push(...tags);
  saveState(state);
}

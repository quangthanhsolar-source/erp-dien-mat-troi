/**
 * Unattended CRM restore via Supabase MCP (agent session must expose MCP).
 * Reads pending jobs from .cursor/_crm-restore-progress.json and applies via
 * subprocess calling crm-mcp-apply-json + manual marker.
 *
 * For fully automated apply, agent should loop:
 *   node scripts/crm-mcp-apply-wave.mjs exec 14 26 W
 *   then CallDynamicTool execute_sql for each tag in manifest (5 parallel)
 *   increment W until done; repeat tinies; gap-fill; check count >= 1220
 */
import fs from 'fs';
import path from 'path';

const progressPath = path.join(process.cwd(), '.cursor', '_crm-restore-progress.json');
const cursor = path.join(process.cwd(), '.cursor');

function load() {
  try {
    return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  } catch {
    return { exec: [], tiny: [], gapB: [], gapD: [] };
  }
}
function save(p) {
  fs.writeFileSync(progressPath, JSON.stringify(p, null, 2) + '\n');
}

const p = load();
const execPending = [];
for (let i = 14; i <= 26; i++) {
  const tag = String(i).padStart(3, '0');
  if (!p.exec.includes(tag)) execPending.push(tag);
}
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const tinyPending = [];
for (let i = 0; i <= 122; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const fp = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
  if (fs.existsSync(fp) && !p.tiny.includes(tag)) tinyPending.push(tag);
}

const wave = Math.floor(execPending.length / 5) === execPending.length / 5 ? 0 : 0;
const nextExec = execPending.slice(0, 5);
const nextTiny = tinyPending.slice(0, 5);

console.log(
  JSON.stringify({
    target: 1220,
    execPending: execPending.length,
    tinyPending: tinyPending.length,
    nextExecWave: nextExec,
    nextTinyWave: nextTiny,
    hint: 'CallDynamicTool execute_sql with .cursor/_mcp-call-TAG.json or tiny-mcp-args',
  })
);

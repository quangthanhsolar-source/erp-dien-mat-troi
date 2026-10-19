/**
 * Monitored loop helper: prints AGENT_LOOP_TICK with next MCP wave instructions.
 * Agent must apply via execute_sql (5 parallel) then re-run this script.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const statePath = path.join(process.cwd(), 'scripts', 'crm-restore-state.json');
const waveScript = path.join(process.cwd(), 'scripts', 'crm-mcp-apply-wave.mjs');

function loadState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}
function saveState(s) {
  fs.writeFileSync(statePath, JSON.stringify(s, null, 2) + '\n');
}

const s = loadState();
const phases = [];

// exec 14-26
const execWave = s.execWave ?? 0;
const r1 = spawnSync(process.execPath, [waveScript, 'exec', '14', '26', String(execWave)], {
  encoding: 'utf8',
});
const j1 = JSON.parse(r1.stdout.trim());
if (!j1.done) phases.push({ kind: 'exec', wave: execWave, tags: j1.tags });

// tinies from wave index
const tinyWave = s.tinyWave ?? 0;
const r2 = spawnSync(process.execPath, [waveScript, 'tiny', '0', '122', String(tinyWave)], {
  encoding: 'utf8',
});
const j2 = JSON.parse(r2.stdout.trim());
if (!j2.done) phases.push({ kind: 'tiny', wave: tinyWave, tags: j2.tags });

if (!phases.length) {
  // gap fill waves
  for (const [kind, start, end, key] of [
    ['gap-b', 0, 30, 'bWave'],
    ['gap-d', 0, 30, 'dWave'],
  ]) {
    const w = s[key] ?? 0;
    const r = spawnSync(process.execPath, [waveScript, kind, String(start), String(end), String(w)], {
      encoding: 'utf8',
    });
    const j = JSON.parse(r.stdout.trim());
    if (!j.done) {
      phases.push({ kind, wave: w, tags: j.tags });
      break;
    }
  }
}

console.log(
  'AGENT_LOOP_TICK crm-restore ' +
    JSON.stringify({ target: s.targetCount, phases, state: s })
);

import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), '.cursor');
const splitDir = path.join(root, '_combo-split');
const tinyDir = path.join(process.env.TEMP || '', 'tiny-mcp-args');
const statePath = path.join(root, '_crm-batch-state.json');

let state = { done: [] };
try {
  state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
} catch {}
const done = new Set(state.done || []);

const queue = [];
if (fs.existsSync(splitDir)) {
  for (const f of fs.readdirSync(splitDir).sort()) {
    const id = `combo:${f}`;
    if (!done.has(id)) queue.push({ id, type: 'sql', path: path.join(splitDir, f) });
  }
}
for (let i = 11; i <= 122; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const id = `tiny:${tag}`;
  const p = path.join(tinyDir, `${tag}.json`);
  if (fs.existsSync(p) && !done.has(id)) queue.push({ id, type: 'tiny', path: p });
}

const n = Number(process.argv[2] ?? 5);
const batch = queue.slice(0, n);
console.log(JSON.stringify({ pending: queue.length, batch }, null, 0));

import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), '.cursor');
const statePath = path.join(root, '_crm-batch-state.json');
let state = { done: [] };
try {
  state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
} catch {}
const done = new Set(state.done || []);
for (const id of process.argv.slice(2)) done.add(id);
state.done = [...done].sort();
fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
console.log('marked', process.argv.slice(2).length, 'total', state.done.length);

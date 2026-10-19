/**
 * Batch runner: reads part payloads 002-026 and combo MCP JSONs,
 * validates query present. Agent runs execute_sql separately.
 * Usage: node crm-run-all-parts-via-node.mjs list
 *        node crm-run-all-parts-via-node.mjs next 5
 */
import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
const progressPath = path.join(cursor, '_crm-restore-progress.json');

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  } catch {
    return { parts: [], tinies: [], combos: [] };
  }
}

const cmd = process.argv[2];
const p = loadProgress();
const doneParts = new Set(p.parts || []);
const doneCombos = new Set(p.combos || []);

const combos = [
  '_mcp-call-combo-002-005.json',
  '_mcp-call-combo-006-009.json',
  '_mcp-call-combo-010-013.json',
  '_mcp-call-combo-014-017.json',
  '_mcp-call-combo-018-021.json',
  '_mcp-call-combo-022-026.json',
];

const parts = [];
for (let i = 2; i <= 26; i++) {
  parts.push(`_payload-${String(i).padStart(3, '0')}.json`);
}

if (cmd === 'list') {
  const pendingCombos = combos.filter((c) => !doneCombos.has(c.replace('.json', '')));
  const pendingParts = parts.filter((f) => !doneParts.has(f.replace('_payload-', '').replace('.json', '')));
  console.log(JSON.stringify({ pendingCombos, pendingParts, doneParts: [...doneParts], doneCombos: [...doneCombos] }, null, 2));
  process.exit(0);
}

if (cmd === 'next') {
  const n = parseInt(process.argv[3] || '5', 10);
  const batch = [];
  for (const c of combos) {
    const tag = c.replace('.json', '');
    if (doneCombos.has(tag)) continue;
    const fp = path.join(cursor, c);
    if (fs.existsSync(fp)) batch.push({ type: 'combo', path: fp, tag });
    if (batch.length >= n) break;
  }
  if (batch.length < n) {
    for (const f of parts) {
      const tag = f.replace('_payload-', '').replace('.json', '');
      if (doneParts.has(tag)) continue;
      const fp = path.join(cursor, f);
      if (fs.existsSync(fp)) batch.push({ type: 'part', path: fp, tag });
      if (batch.length >= n) break;
    }
  }
  console.log(JSON.stringify({ batch }, null, 2));
}

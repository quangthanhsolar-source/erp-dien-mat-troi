/**
 * Print one wave of MCP execute_sql payloads as JSON lines (max 5).
 * Agent: parse each line → CallDynamicTool execute_sql.
 *
 * Usage:
 *   node crm-mcp-wave.mjs parts 2 26 0
 *   node crm-mcp-wave.mjs tinies 31 122 0
 *   node crm-mcp-wave.mjs combo 0
 *   node crm-mcp-wave.mjs exec 51 122 0
 *
 * waveIndex is 0-based (0 = first batch of 5).
 */
import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const [kind, a, b, waveStr] = process.argv.slice(2);
const wave = parseInt(waveStr || '0', 10);
const batchSize = 5;

function loadJsonQuery(fp) {
  const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
  return { project_id: j.project_id, query: j.query, path: fp };
}

let items = [];
if (kind === 'parts') {
  const start = parseInt(a, 10);
  const end = parseInt(b, 10);
  for (let i = start; i <= end; i++) {
    const tag = String(i).padStart(3, '0');
    const fp = path.join(cursor, `_run-${tag}.json`);
    if (fs.existsSync(fp)) items.push({ tag, ...loadJsonQuery(fp) });
  }
} else if (kind === 'tinies') {
  const start = parseInt(a, 10);
  const end = parseInt(b, 10);
  for (let i = start; i <= end; i++) {
    const tag = `t${String(i).padStart(3, '0')}`;
    const fp = path.join(tmp, 'tiny-mcp-args', `${tag}.json`);
    if (fs.existsSync(fp)) items.push({ tag, ...loadJsonQuery(fp) });
  }
} else if (kind === 'exec') {
  const start = parseInt(a, 10);
  const end = parseInt(b, 10);
  for (let i = start; i <= end; i++) {
    const tag = `t${String(i).padStart(3, '0')}`;
    const fp = path.join(cursor, `_exec-${tag}.json`);
    if (fs.existsSync(fp)) items.push({ tag, ...loadJsonQuery(fp) });
  }
} else if (kind === 'combo') {
  const files = [
    '_mcp-call-combo-002-005.json',
    '_mcp-call-combo-006-009.json',
    '_mcp-call-combo-010-013.json',
    '_mcp-call-combo-014-017.json',
    '_mcp-call-combo-018-021.json',
    '_mcp-call-combo-022-026.json',
  ];
  for (const f of files) {
    const fp = path.join(cursor, f);
    if (fs.existsSync(fp)) items.push({ tag: f.replace('.json', ''), ...loadJsonQuery(fp) });
  }
} else {
  console.error('usage: parts|tinies|combo');
  process.exit(1);
}

const slice = items.slice(wave * batchSize, (wave + 1) * batchSize);
if (!slice.length) {
  console.log(JSON.stringify({ done: true, total: items.length }));
  process.exit(0);
}
console.log(JSON.stringify({ wave, total: items.length, batch: slice.map(({ tag, project_id, query, path: p }) => ({ tag, project_id, queryLen: query.length, path: p, project_id, query })) }));

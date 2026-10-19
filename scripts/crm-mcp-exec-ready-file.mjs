/**
 * Apply one _mcp-ready-NNN.json via agent: prints tag + lengths only.
 * Agent must CallDynamicTool execute_sql with JSON.parse(fs.readFileSync(path)).
 * Usage: node crm-mcp-exec-ready-file.mjs 015
 */
import fs from 'fs';
import path from 'path';

const tag = process.argv[2];
const fp = path.join(process.cwd(), '.cursor', `_mcp-ready-${tag}.json`);
const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
console.log(JSON.stringify({ tag, project_id: j.project_id, queryLen: j.query.length, file: fp }));

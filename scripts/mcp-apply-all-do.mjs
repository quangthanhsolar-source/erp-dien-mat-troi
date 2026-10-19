/**
 * Builds tiny-mcp-args style JSON for every crm-b64-do/dXX.sql (agent runs execute_sql 4-wide).
 * Usage: node mcp-apply-all-do.mjs
 * Then agent: for each file in %TEMP%\do-mcp-queue\*.json → execute_sql(JSON.parse(file).query)
 */
import fs from 'fs';
import path from 'path';

const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const outDir = path.join(tmp, 'do-mcp-queue');
const project_id = 'ceiuwiamqszmxmqtbemy';
const srcDir = path.join(tmp, 'crm-b64-do');

fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter((f) => /^d\d+\.sql$/i.test(f)).sort();
for (const f of files) {
  const tag = f.replace(/\.sql$/i, '');
  const query = fs.readFileSync(path.join(srcDir, f), 'utf8');
  fs.writeFileSync(path.join(outDir, `${tag}.json`), JSON.stringify({ project_id, query }));
}
console.log('queued', files.length, '→', outDir);

/**
 * Prints one line: project_id TAB query_length (agent reads _q-NNN.txt + MCP).
 * Usage: node crm-mcp-exec-from-file.mjs 014
 */
import fs from 'fs';
import path from 'path';

const tag = process.argv[2];
const fp = path.join(process.cwd(), '.cursor', `_q-${tag}.txt`);
if (!fs.existsSync(fp)) {
  console.error('missing', fp);
  process.exit(1);
}
const query = fs.readFileSync(fp, 'utf8');
process.stdout.write(`ceiuwiamqszmxmqtbemy\t${query.length}\t${tag}`);

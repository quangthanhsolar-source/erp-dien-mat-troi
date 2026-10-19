/**
 * Prints MCP execute_sql args as JSON for one decoded batch tag (e.g. d01).
 * Agent: node run-decoded-via-mcp-helper.mjs 01 | use JSON with CallDynamicTool
 */
import fs from 'fs';
import path from 'path';

const tag = String(process.argv[2] ?? '01').padStart(2, '0');
const decoded = path.join(process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp', 'crm-decoded');
const query = fs.readFileSync(path.join(decoded, `d${tag}.sql`), 'utf8');
process.stdout.write(JSON.stringify({ project_id: 'ceiuwiamqszmxmqtbemy', query }));

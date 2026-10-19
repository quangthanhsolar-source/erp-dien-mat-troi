/** Pack N tiny SQL files into one JSON array for agent MCP batch. */
import fs from 'fs';
import path from 'path';

const start = parseInt(process.argv[2] || '51', 10);
const count = parseInt(process.argv[3] || '5', 10);
const queue = path.join(process.cwd(), '.cursor', '_mcp-queue');
const out = process.argv[4] || path.join(process.cwd(), '.cursor', '_mcp-batch-next.json');

const batch = [];
for (let i = start; i < start + count && i <= 122; i++) {
  const tag = `t${String(i).padStart(3, '0')}`;
  const sqlPath = path.join(queue, `${tag}.sql`);
  if (!fs.existsSync(sqlPath)) break;
  batch.push({
    tag,
    project_id: 'ceiuwiamqszmxmqtbemy',
    query: fs.readFileSync(sqlPath, 'utf8'),
  });
}
fs.writeFileSync(out, JSON.stringify({ batch }, null, 2), 'utf8');
console.log(JSON.stringify({ out, tags: batch.map((b) => b.tag) }));

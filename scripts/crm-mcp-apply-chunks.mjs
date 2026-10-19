/** Print paths of chunk JSON files for agent to MCP in waves of 5 */
import fs from 'fs';
import path from 'path';
const dir = path.join(process.cwd(), '.cursor');
const files = fs.readdirSync(dir)
  .filter((f) => /^_chunk(_2)?_\d+\.json$/.test(f))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0], 10);
    const nb = parseInt(b.match(/\d+/)[0], 10);
    const pa = a.startsWith('_chunk2_') ? 100 + na : na;
    const pb = b.startsWith('_chunk2_') ? 100 + nb : nb;
    return pa - pb;
  });
for (const f of files) {
  if (f === '_chunk_0.json') continue; // duplicate of t105
  console.log(path.join(dir, f));
}

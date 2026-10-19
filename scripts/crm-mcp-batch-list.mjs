/** Print JSON array of {tag,file,qlen} for pending MCP apply (UTF-8 safe). */
import fs from 'fs';
import path from 'path';

const cursor = path.join(process.cwd(), '.cursor');
const tmp = process.env.TEMP || 'C:\\Users\\Administrator\\AppData\\Local\\Temp';
const tinyDir = path.join(tmp, 'tiny-mcp-args');

const lists = [
  ...Array.from({ length: 13 }, (_, i) => {
    const tag = String(14 + i).padStart(3, '0');
    const pay = path.join(cursor, `_pay-${tag}.json`);
    return fs.existsSync(pay) ? { tag, file: pay } : null;
  }),
  ...Array.from({ length: 123 }, (_, i) => {
    const tag = `t${String(i).padStart(3, '0')}`;
    const f = path.join(tinyDir, `${tag}.json`);
    return fs.existsSync(f) ? { tag, file: f } : null;
  }),
  ...Array.from({ length: 31 }, (_, i) => {
    const tag = `b${String(i).padStart(2, '0')}`;
    const f = path.join(tmp, 'crm-mcp-out', `${tag}.json`);
    return fs.existsSync(f) ? { tag, file: f } : null;
  }),
  ...Array.from({ length: 31 }, (_, i) => {
    const tag = `d${String(i).padStart(2, '0')}`;
    const f = path.join(tmp, `mcp-arg-${tag}.json`);
    return fs.existsSync(f) ? { tag, file: f } : null;
  }),
].filter(Boolean);

const extra = [
  path.join(cursor, '_combo_part0.json'),
  path.join(cursor, '_combo_part1.json'),
  path.join(cursor, '_combo_part2.json'),
  path.join(cursor, '_combo_part3.json'),
  path.join(tmp, 'mcp-combo-022-utf8.json'),
].filter((f) => fs.existsSync(f)).map((file) => ({ tag: path.basename(file), file }));

const all = [...lists, ...extra].map(({ tag, file }) => {
  let qlen = 0;
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    qlen = (j.query || '').length;
  } catch {
    qlen = fs.readFileSync(file, 'utf8').length;
  }
  return { tag, file, qlen };
});

console.log(JSON.stringify({ count: all.length, items: all.slice(0, 30) }));

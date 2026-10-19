const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = html.indexOf('DB.panels=[');
const end = html.indexOf('/* Snapshot danh mục gốc');
const block = html.slice(start, end);
const codes = [...block.matchAll(/"code"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
console.log('seed codes', codes.length);

const dir = 'C:/Users/Administrator/Downloads';
const file = fs.readdirSync(dir).find(f => /Bảng giá mới của sản phẩm/i.test(f));
const rows = XLSX.utils.sheet_to_json(XLSX.readFile(path.join(dir, file)).Sheets['Bảng giá tổng'], { header: 1, defval: '' });
let mode = null;
const excel = [];
for (const r of rows) {
  const c2 = String(r[2] || '').trim();
  const c7 = String(r[7] || '').replace(/\s+/g, ' ');
  if (/MÃ QUANG THANH/i.test(c2) && /VAT|Vào/i.test(c7)) { mode = 'qt'; continue; }
  if (/MÃ NEWSUN/i.test(c2)) { mode = 'ns'; continue; }
  if (mode === 'qt' && c2 && !/mã|chi tiết|model|stt/i.test(c2)) {
    const hasPrice = [7, 8, 9, 10].some(i => r[i] !== '' && r[i] != null);
    if (hasPrice) excel.push(String(c2).trim());
  }
}
console.log('excel qt priced codes', excel.length);
const seedSet = new Set(codes.map(c => c.toLowerCase()));
const miss = excel.filter(c => !seedSet.has(String(c).toLowerCase()));
const hit = excel.filter(c => seedSet.has(String(c).toLowerCase()));
console.log('hit', hit.length, 'miss', miss.length);
console.log('miss list', miss);
console.log('hit sample', hit.slice(0, 50));

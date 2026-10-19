const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const dir = 'C:/Users/Administrator/Downloads';
const file = fs.readdirSync(dir).find(f => f.includes('giá mới') || f.includes('gia moi') || /Bảng giá mới/i.test(f));
const full = path.join(dir, file);
const wb = XLSX.readFile(full);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
// find header row
let headerIdx = -1;
for (let i = 0; i < Math.min(30, rows.length); i++) {
  const r = rows[i].map(x => String(x).replace(/\s+/g, ' ').trim());
  if (r.some(c => /MÃ|MA NEWSUN|Mã/i.test(c)) && r.some(c => /VAT|Vào/i.test(c))) {
    headerIdx = i;
    console.log('HEADER ROW', i, r);
    break;
  }
}
const data = [];
for (let i = headerIdx + 1; i < rows.length; i++) {
  const r = rows[i];
  const code = String(r[2] ?? '').trim(); // guess col
  // print a few product-like rows
  const joined = r.map(x => String(x).trim()).filter(Boolean);
  if (joined.length >= 4) data.push({ i, cells: r.slice(0, 12) });
}
console.log('data-like', data.length);
console.log(JSON.stringify(data.slice(0, 15), null, 2));
// also print columns by index for first product row
const sample = data.find(d => String(d.cells[2]||'').trim() && String(d.cells[6]||'').match(/\d/));
console.log('SAMPLE', sample);

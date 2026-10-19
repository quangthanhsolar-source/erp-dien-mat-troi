/**
 * Quy đổi giá seed thiết bị: đã từng ×0.92 → đúng ÷1.08
 * new = round(old / 0.92 / 1.08)
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'index.html');
let s = fs.readFileSync(file, 'utf8');

// Chỉ đổi trong khối danh mục seed (từ DB.panels= đến trước SEED_CATALOG)
const startMark = 'DB.panels=[';
const endMark = '/* Snapshot danh mục gốc';
const start = s.indexOf(startMark);
const end = s.indexOf(endMark);
if (start < 0 || end < 0 || end <= start) {
  console.error('Cannot find seed catalog block');
  process.exit(1);
}

const before = s.slice(0, start);
let block = s.slice(start, end);
const after = s.slice(end);

const fields = ['cost', 'ctv', 'floor', 'retail'];
let n = 0;
for (const f of fields) {
  const re = new RegExp('("' + f + '":)(-?\\d+(?:\\.\\d+)?)', 'g');
  block = block.replace(re, (m, p, num) => {
    const v = Number(num);
    if (!Number.isFinite(v)) return m;
    const nv = Math.round(v / 0.92 / 1.08);
    if (nv === v) return m;
    n++;
    return p + String(nv);
  });
}

s = before + block + after;
fs.writeFileSync(file, s);
console.log('converted', n, 'price fields');

const i = s.indexOf('"code":"620"');
console.log(s.slice(i, i + 220));

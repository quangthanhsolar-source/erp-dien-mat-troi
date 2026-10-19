/**
 * Cập nhật giá thiết bị từ "Bảng giá mới của sản phẩm.xlsx"
 * Excel đã gồm VAT → lưu vào app = round(giá / 1.08)
 * Header QT: GIÁ NHẬP / GIÁ TỰ LẮP / GIÁ MIN / GIÁ KHÁCH (hoặc Vào VAT cũ)
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const OUT_SQL = path.join(ROOT, 'scripts', '_price-update.sql');
const OUT_JSON = path.join(ROOT, 'scripts', '_price-update.json');
const OUT_FULL_SQL = path.join(ROOT, 'scripts', '_price-update-full.sql');

const dir = 'C:/Users/Administrator/Downloads';
const file = fs.readdirSync(dir).find(f => /Bảng giá mới của sản phẩm/i.test(f));
if (!file) throw new Error('Không tìm thấy file Excel bảng giá mới');
const full = path.join(dir, file);
console.log('Excel:', full, 'mtime', fs.statSync(full).mtime.toISOString());

const wb = XLSX.readFile(full);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

function toNum(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = +String(v).replace(/[^\d.-]/g, '');
  return Number.isFinite(n) ? n : null;
}
function exVat(v) {
  const n = toNum(v);
  if (n == null) return null;
  return Math.round(n / 1.08);
}
function normCode(c) {
  return String(c ?? '').trim().toLowerCase();
}
function isQtHeader(c2, c7) {
  return /MÃ QUANG THANH|MA QUANG THANH/i.test(c2)
    && (/GIÁ NHẬP|GIA NHAP|Vào|VAO|VAT/i.test(c7));
}
function isNewsunHeader(c2) {
  return /MÃ NEWSUN|MA NEWSUN/i.test(c2);
}

const priceByCode = new Map();
let mode = null;
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const c2 = String(r[2] ?? '').replace(/\s+/g, ' ').trim();
  const c7 = String(r[7] ?? '').replace(/\s+/g, ' ').trim();

  if (isQtHeader(c2, c7)) {
    mode = 'qt';
    console.log('QT header at row', i, c7);
    continue;
  }
  if (isNewsunHeader(c2)) {
    mode = 'newsun';
    console.log('NEWSUN header at row', i);
    continue;
  }
  if (!mode) continue;

  const codeRaw = String(r[2] ?? '').trim();
  if (!codeRaw || /mã|chi tiết|model|nguồn|stt/i.test(codeRaw)) continue;

  const costIn = toNum(r[7]);
  const ctvIn = toNum(r[8]);
  const floorIn = toNum(r[9]);
  const retailIn = toNum(r[10]);
  if (costIn == null && ctvIn == null && floorIn == null && retailIn == null) continue;
  // bỏ dòng tổng/placeholder toàn 0
  if ((costIn || 0) === 0 && (ctvIn || 0) === 0 && (floorIn || 0) === 0 && (retailIn || 0) === 0) continue;

  const code = normCode(codeRaw);
  let cost = exVat(costIn);
  let ctv = exVat(ctvIn);
  let floor = exVat(floorIn);
  let retail = exVat(retailIn);
  // NEWSUN: chỉ có Vào VAT + KHÁCH → ctv≈cost, floor≈retail
  if (mode === 'newsun') {
    if (ctv == null && cost != null) ctv = cost;
    if (floor == null && retail != null) floor = retail;
  }
  const rec = {
    code: codeRaw,
    cost, ctv, floor, retail,
    costIn, ctvIn, floorIn, retailIn,
    mode
  };
  // QT ưu tiên ghi đè NEWSUN nếu trùng mã
  if (!priceByCode.has(code) || mode === 'qt') priceByCode.set(code, rec);
}
console.log('Parsed Excel codes:', priceByCode.size);

let html = fs.readFileSync(INDEX, 'utf8');
const startMark = 'DB.panels=[';
const endMark = '/* Snapshot danh mục gốc';
const start = html.indexOf(startMark);
const end = html.indexOf(endMark);
if (start < 0 || end < 0) throw new Error('seed block not found');

const before = html.slice(0, start);
const block = html.slice(start, end);
const after = html.slice(end);

const updates = [];
const missed = [];
const seedCodes = [];
const seedOrder = [];

const newBlock = block.split('\n').map(line => {
  const m = line.match(/"code"\s*:\s*"([^"]+)"/);
  if (!m) return line;
  const code = m[1];
  seedCodes.push(code);
  seedOrder.push(normCode(code));
  const p = priceByCode.get(normCode(code));
  if (!p) {
    if (/"cost"\s*:/.test(line)) missed.push(code);
    return line;
  }
  let next = line;
  const beforeVals = {};
  for (const field of ['cost', 'ctv', 'floor', 'retail']) {
    const mm = next.match(new RegExp(`"${field}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
    if (mm) beforeVals[field] = +mm[1];
  }
  for (const [field, val] of [['cost', p.cost], ['ctv', p.ctv], ['floor', p.floor], ['retail', p.retail]]) {
    if (val == null) continue;
    const fr = new RegExp(`("${field}"\\s*:\\s*)(-?\\d+(?:\\.\\d+)?)`);
    if (fr.test(next)) next = next.replace(fr, `$1${val}`);
  }
  if (next !== line) {
    updates.push({
      code, cost: p.cost, ctv: p.ctv, floor: p.floor, retail: p.retail,
      costIn: p.costIn, retailIn: p.retailIn,
      prev: beforeVals
    });
  }
  return next;
}).join('\n');

fs.writeFileSync(INDEX, before + newBlock + after);

const excelOnly = [...priceByCode.keys()].filter(k => !seedOrder.includes(k));

// SQL chỉ dòng seed đổi
const sqlLines = ['-- Auto price update from Bảng giá mới (÷1.08)', 'BEGIN;'];
updates.forEach(u => {
  const sets = [];
  if (u.cost != null) sets.push(`cost = ${u.cost}`);
  if (u.ctv != null) sets.push(`ctv = ${u.ctv}`);
  if (u.floor != null) sets.push(`floor_price = ${u.floor}`);
  if (u.retail != null) sets.push(`retail = ${u.retail}`);
  if (!sets.length) return;
  sets.push('updated_at = NOW()');
  const esc = String(u.code).replace(/'/g, "''");
  sqlLines.push(`UPDATE products SET ${sets.join(', ')} WHERE lower(trim(code)) = lower('${esc}');`);
});
sqlLines.push(`UPDATE erp_seq SET updated_at = NOW() WHERE id = 'main';`);
sqlLines.push('COMMIT;');
fs.writeFileSync(OUT_SQL, sqlLines.join('\n'));

// SQL FULL: mọi mã seed khớp Excel (ép ghi đè Supabase)
const fullLines = [];
let fullN = 0;
for (const code of seedCodes) {
  const p = priceByCode.get(normCode(code));
  if (!p) continue;
  const sets = [];
  if (p.cost != null) sets.push(`cost = ${p.cost}`);
  if (p.ctv != null) sets.push(`ctv = ${p.ctv}`);
  if (p.floor != null) sets.push(`floor_price = ${p.floor}`);
  if (p.retail != null) sets.push(`retail = ${p.retail}`);
  if (!sets.length) continue;
  sets.push('updated_at = NOW()');
  const esc = String(code).replace(/'/g, "''");
  fullLines.push(`UPDATE products SET ${sets.join(', ')} WHERE lower(trim(code)) = lower('${esc}');`);
  fullN++;
}
fullLines.push(`UPDATE erp_seq SET updated_at = NOW() WHERE id = 'main';`);
fs.writeFileSync(OUT_FULL_SQL, fullLines.join('\n'));

// Chunks 40 dòng cho MCP
const chunkSize = 40;
const chunks = [];
for (let i = 0; i < fullLines.length; i += chunkSize) {
  const part = fullLines.slice(i, i + chunkSize);
  // giữ erp_seq ở chunk cuối
  const name = path.join(ROOT, 'scripts', `_c${chunks.length}.sql`);
  fs.writeFileSync(name, part.join('\n') + '\n');
  chunks.push(name);
}

fs.writeFileSync(OUT_JSON, JSON.stringify({
  updatedSeedLines: updates.length,
  fullSql: fullN,
  missedSeed: missed,
  excelOnlyNotInSeed: excelOnly,
  sample: updates.slice(0, 15),
  check615: priceByCode.get('615'),
  check625: priceByCode.get('625'),
  check655: priceByCode.get('655'),
  check620: priceByCode.get('620'),
  chunks
}, null, 2));

console.log({
  updatedSeedLines: updates.length,
  fullSql: fullN,
  missedSeed: missed.length,
  excelNotInSeed: excelOnly.length,
  chunks: chunks.length
});
console.log('615', priceByCode.get('615'));
console.log('625', priceByCode.get('625'));
console.log('655', priceByCode.get('655'));
console.log('Missed', missed.slice(0, 30));
console.log('Excel-only', excelOnly.slice(0, 30));

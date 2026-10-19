/** Generate SQL for ALL Excel QT codes matched to seed (÷1.08), not only changed lines */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const OUT_SQL = path.join(ROOT, 'scripts', '_price-update-full.sql');

const dir = 'C:/Users/Administrator/Downloads';
const file = fs.readdirSync(dir).find(f => /Bảng giá mới của sản phẩm/i.test(f));
const rows = XLSX.utils.sheet_to_json(XLSX.readFile(path.join(dir, file)).Sheets['Bảng giá tổng'], { header: 1, defval: '' });

function toNum(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = +String(v).replace(/[^\d.-]/g, '');
  return Number.isFinite(n) ? n : null;
}
function exVat(v) {
  const n = toNum(v);
  return n == null ? null : Math.round(n / 1.08);
}
function normCode(c) { return String(c ?? '').trim().toLowerCase(); }

const priceByCode = new Map();
let mode = null;
for (const r of rows) {
  const c2 = String(r[2] ?? '').replace(/\s+/g, ' ').trim();
  const c7 = String(r[7] ?? '').replace(/\s+/g, ' ').trim();
  if (/MÃ QUANG THANH/i.test(c2) && /Vào|VAT/i.test(c7)) { mode = 'qt'; continue; }
  if (/MÃ NEWSUN/i.test(c2)) { mode = 'ns'; continue; }
  if (mode !== 'qt') continue;
  const codeRaw = String(r[2] ?? '').trim();
  if (!codeRaw || /mã|chi tiết|model|nguồn|stt/i.test(codeRaw)) continue;
  const cost = exVat(r[7]), ctv = exVat(r[8]), floor = exVat(r[9]), retail = exVat(r[10]);
  if (cost == null && ctv == null && floor == null && retail == null) continue;
  priceByCode.set(normCode(codeRaw), { code: codeRaw, cost, ctv, floor, retail });
}

const html = fs.readFileSync(INDEX, 'utf8');
const start = html.indexOf('DB.panels=[');
const end = html.indexOf('/* Snapshot danh mục gốc');
const block = html.slice(start, end);
const seedCodes = [...block.matchAll(/"code"\s*:\s*"([^"]+)"/g)].map(m => m[1]);

const lines = [];
let n = 0;
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
  lines.push(`UPDATE products SET ${sets.join(', ')} WHERE lower(trim(code)) = lower('${esc}');`);
  n++;
}
lines.push(`UPDATE erp_seq SET updated_at = NOW() WHERE id = 'main';`);
fs.writeFileSync(OUT_SQL, lines.join('\n'));
console.log('SQL updates', n, 'file', OUT_SQL);

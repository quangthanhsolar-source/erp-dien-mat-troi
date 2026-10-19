const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync(path.join(__dirname, '_price-update-full.sql'), 'utf8')
  .trim().split(/\n/).filter(l => l.startsWith('UPDATE products'));
const values = [];
for (const line of lines) {
  const m = line.match(/cost = (-?\d+), ctv = (-?\d+), floor_price = (-?\d+), retail = (-?\d+).*lower\('([^']+)'\)/i);
  if (!m) continue;
  values.push(`('${m[5].replace(/'/g, "''")}', ${m[1]}, ${m[2]}, ${m[3]}, ${m[4]})`);
}
const sql = `WITH v(code, cost, ctv, floor_price, retail) AS (VALUES\n${values.join(',\n')}\n)
UPDATE products p SET
  cost = v.cost,
  ctv = v.ctv,
  floor_price = v.floor_price,
  retail = v.retail,
  updated_at = NOW()
FROM v
WHERE lower(trim(p.code)) = lower(v.code);

UPDATE erp_seq SET updated_at = NOW() WHERE id = 'main';

SELECT count(*) AS updated FROM products p
JOIN (VALUES ${values.join(',')}) AS v(code, cost, ctv, floor_price, retail)
  ON lower(trim(p.code)) = lower(v.code);`;
fs.writeFileSync(path.join(__dirname, '_price-upsert-one.sql'), sql);
console.log('values', values.length, 'bytes', sql.length);

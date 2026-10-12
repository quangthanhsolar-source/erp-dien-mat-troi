const fs = require('fs');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');
const codes = [
  'MG8', 'MG6', 'mg6', 'MG12', 'MG10', 'MG5', 'mg5',
  'SG125', 'sg125', 'SG150', 'sg150', 'SG33', 'sg33', 'SG50',
  'SVE6', 'sve6',
];
for (const c of codes) {
  const re = new RegExp('\\{"code":"' + c + '"[^}]{0,120}', 'i');
  const hit = s.match(re);
  console.log(c, hit ? hit[0].slice(0, 110) : 'MISSING');
}
console.log('--- sungrow ---');
fs.readdirSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/products/sungrow').forEach((f) =>
  console.log(f)
);
console.log('--- sve ---');
fs.readdirSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/products/sve').forEach((f) =>
  console.log(f)
);

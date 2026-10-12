const fs = require('fs');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');
const codes = [
  'S15', 'SL16', 'SL12', 'SL6', 'S18', 'SL14', 'SL8', 'S10', 'S8', 'S12', 'SL5',
  'SL125', 'sl125', 'SL80', 'SL110', 'SL99',
];
for (const c of codes) {
  const re = new RegExp('\\{"code":"' + c + '"[^}]{0,120}', 'i');
  const hit = s.match(re);
  console.log(c, hit ? hit[0].slice(0, 110) : 'MISSING');
}
console.log('--- solis files ---');
fs.readdirSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/products/solis').forEach((f) =>
  console.log(f)
);

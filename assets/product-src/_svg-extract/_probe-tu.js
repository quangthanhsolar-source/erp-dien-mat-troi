const fs = require('fs');
const path = require('path');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');
const codes = [
  'TUBT', 'TUHYBRID1P', 'TUHYBRID3P', 'TUATS', 'TUIN', 'TUIN5', 'cab',
];
for (const c of codes) {
  const re = new RegExp('\\{"code":"' + c + '"[^}]{0,160}', 'i');
  const hit = s.match(re);
  console.log(c, hit ? hit[0].slice(0, 150) : 'MISSING');
}
const all = [...s.matchAll(/\{"code":"(TU[^"]+)"[^}]*?"brand":"([^"]+)"/gi)];
console.log('--- all TU* ---');
all.forEach((m) => console.log(m[1], m[2]));
const root = 'C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/products';
for (const brand of fs.readdirSync(root)) {
  const files = fs.readdirSync(path.join(root, brand)).filter((f) => /TU|cab|cabinet/i.test(f));
  if (files.length) console.log(brand + ':', files.join(', '));
}
console.log('cabinets dir?', fs.existsSync(path.join(root, 'cabinets')));
console.log('brands', fs.readdirSync(root).join(', '));

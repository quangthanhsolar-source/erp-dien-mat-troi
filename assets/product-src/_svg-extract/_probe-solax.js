const fs = require('fs');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');
const codes = ['NEO10', 'NEO20', 'NEO15', 'X8', 'X10', 'X12', 'X49', 'X60', 'X6', 'X5', 'X14'];
for (const c of codes) {
  const re = new RegExp('\\{"code":"' + c + '"[^}]{0,140}', 'i');
  const hit = s.match(re);
  console.log(c, hit ? hit[0].slice(0, 120) : 'MISSING');
}
console.log('--- solax files ---');
const dir = 'C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/products/solax';
if (fs.existsSync(dir)) fs.readdirSync(dir).forEach((f) => console.log(f));
else console.log('no solax dir');

const fs = require('fs');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');
const codes = [
  'GEN10', 'GEN8', 'GEN12', 'GEN14', 'L20', 'L12', 'L15', 'TR30', 'LXP12', 'LXP6',
  'SNA10', 'SNA14', 'SNA12', 'SNA6', 'SNA5', 'SNAPro', 'SNApro', 'TR25', 'tr25',
  'TR10', 'TR15', 'TR20', 'EB', 'EB5', 'EB10', 'EB15', 'HIG5',
];
for (const c of codes) {
  const re = new RegExp('\\{"code":"' + c.replace('.', '\\.') + '"[^}]{0,120}', 'i');
  const hit = s.match(re);
  console.log(c, hit ? hit[0].slice(0, 110) : 'MISSING');
}
console.log('--- lux files ---');
fs.readdirSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/products/luxpower').forEach((f) =>
  console.log(f)
);
// any GEN* SNA* codes
const all = [...s.matchAll(/\{"code":"((?:GEN|SNA|LXP|TR|L)\w*)"[^}]*?"brand":"([^"]+)"/gi)];
console.log('--- matching brand codes ---');
all.forEach((m) => console.log(m[1], m[2]));

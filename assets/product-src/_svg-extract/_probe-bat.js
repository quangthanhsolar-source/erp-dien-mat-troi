const fs = require('fs');
const path = require('path');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');
const codes = [
  'FB16', 'FLEX16', 'HI14', 'HI16', 'hi16', 'HI5', 'HIG5', 'LD15', 'LD16',
  'LI7.5', 'Li7.5', 'MBL16', 'SVE14', 'sve14', 'SVE16.6', 'sve16.6', 'SVE16',
  'VL10', 'VL16', 'VL21', 'VL5', 'VLH5', 'X14',
];
for (const c of codes) {
  const re = new RegExp('\\{"code":"' + c.replace('.', '\\.') + '"[^}]{0,140}', 'i');
  const hit = s.match(re);
  console.log(c, hit ? hit[0].slice(0, 130) : 'MISSING');
}
const root = 'C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/products';
for (const brand of fs.readdirSync(root)) {
  const files = fs.readdirSync(path.join(root, brand)).filter((f) =>
    /FB16|FLEX|HI14|HI16|HI5|HIG5|LD15|LD16|Li7|MBL16|sve|VL|X14/i.test(f)
  );
  if (files.length) console.log(brand + ':', files.join(', '));
}

const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Administrator/Downloads';
const file = fs.readdirSync(dir).find(f => /bang gia moi|bảng giá mới/i.test(f) || f.includes('gia moi') || /B.*ng gi.*m.*i.*s.*n ph/i.test(f));
if (!file) {
  const all = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));
  console.log('candidates', all.filter(f => /gi/i.test(f) && /ph/i.test(f)));
  process.exit(1);
}
const full = path.join(dir, file);
console.log('FILE', full, fs.statSync(full).size);

async function main() {
  let XLSX;
  try { XLSX = require('xlsx'); }
  catch (e) {
    const { execSync } = require('child_process');
    execSync('npm install xlsx --no-save', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    XLSX = require('xlsx');
  }
  const wb = XLSX.readFile(full);
  console.log('sheets', wb.SheetNames);
  for (const n of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: '', header: 1 });
    console.log('\n===', n, 'grid rows', rows.length);
    console.log('first5', JSON.stringify(rows.slice(0, 5), null, 2));
    const objs = XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: '' });
    console.log('obj count', objs.length);
    if (objs[0]) console.log('keys', Object.keys(objs[0]));
    console.log('sample', JSON.stringify(objs.slice(0, 2), null, 2));
  }
}
main().catch(e => { console.error(e); process.exit(1); });

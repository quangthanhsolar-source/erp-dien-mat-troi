const fs = require('fs');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');

const needles = ['TUBT', 'TUHYBRID', 'HYBRID1P', 'HYBRID3P', 'Tủ điện', 'tu dien', 'bám tải', 'hybrid'];
for (const n of needles) {
  const idx = s.toLowerCase().indexOf(n.toLowerCase());
  console.log(n, 'firstIdx', idx);
}

// cabinets array entries
const cabBlock = s.match(/DB\.cabinets\s*=\s*\[([\s\S]*?)\];/);
const invCab = [...s.matchAll(/\{"code":"([^"]+)"[^}]*?"brand":"QUANG THANH"[^}]*?\}/g)];
console.log('--- QUANG THANH products ---');
const qt = [...s.matchAll(/\{"code":"([^"]+)"[^}]*?"brand":"QUANG THANH"[^}]*?"name":"([^"]+)"/g)];
qt.forEach((m) => console.log(m[1], '|', m[2]));

// also search cabinets in seed
const cabs = [...s.matchAll(/\{"code":"([^"]+)"[^}]*?"name":"([^"]*[Tt][ủu][^"]*)"[^}]*?\}/g)];
console.log('--- name has Tu ---');
cabs.slice(0, 40).forEach((m) => console.log(m[1], '|', m[2]));

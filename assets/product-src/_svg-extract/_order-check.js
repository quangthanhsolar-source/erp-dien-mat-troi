const fs = require('fs');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');
const i = s.indexOf('applyPimgOverrides();');
console.log('context around first call:\n', s.slice(i - 200, i + 250));
const j = s.indexOf('const DB=');
const k = s.indexOf('let DB');
console.log('const DB at', j, 'let DB at', k);
console.log('applyPimgToDB first', s.indexOf('applyPimgToDB();'));

const fs = require('fs');
const s = fs.readFileSync('C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html', 'utf8');

const has = s.includes('const CATALOG_PRODUCT_IMGS=');
console.log('has catalog', has);
console.log('snippet def', s.slice(s.indexOf('const CATALOG_PRODUCT_IMGS='), s.indexOf('const CATALOG_PRODUCT_IMGS=') + 180));

const re = /applyPimgOverrides\(\);|applyCatalogProductImgs\(\);|applyPimgToDB\(\);/g;
let m;
const hits = [];
while ((m = re.exec(s))) hits.push({ at: m.index, text: m[0] });
console.log('sequence of key calls:');
hits.slice(0, 20).forEach((h) => console.log(h.at, h.text));

// ensure after cloud sync catalog also applied
const syncIdx = hits.filter((h) => h.text.includes('Overrides') || h.text.includes('Catalog') || h.text.includes('ToDB'));
console.log('total key calls', hits.length);

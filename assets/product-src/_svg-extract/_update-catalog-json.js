const fs = require('fs');

const htmlPath = 'C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html';
const catalog = JSON.parse(
  fs.readFileSync(
    'C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/product-src/_svg-extract/catalog-map.json',
    'utf8'
  )
);

let s = fs.readFileSync(htmlPath, 'utf8');
const start = s.indexOf('const CATALOG_PRODUCT_IMGS=');
if (start < 0) throw new Error('CATALOG_PRODUCT_IMGS missing');
const end = s.indexOf(';', start);
if (end < 0) throw new Error('end of CATALOG_PRODUCT_IMGS missing');
const next = s.slice(end + 1, end + 40);
if (!next.includes('function applyCatalogProductImgs')) {
  console.log('warn next=', JSON.stringify(next.slice(0, 40)));
}
s = s.slice(0, start) + 'const CATALOG_PRODUCT_IMGS=' + JSON.stringify(catalog) + s.slice(end);
fs.writeFileSync(htmlPath, s);
console.log('updated catalog keys', Object.keys(catalog).length);
console.log(
  'lux sample',
  catalog.GEN10,
  catalog.sna10,
  catalog.SNAPro,
  catalog.GEN12,
  catalog.LXP6
);

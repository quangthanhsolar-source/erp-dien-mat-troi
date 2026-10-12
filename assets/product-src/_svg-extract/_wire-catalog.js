const fs = require('fs');
const path = require('path');

const htmlPath = 'C:/Users/Administrator/Projects/erp-dien-mat-troi/index.html';
const catalog = JSON.parse(
  fs.readFileSync(
    'C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/product-src/_svg-extract/catalog-map.json',
    'utf8'
  )
);

let s = fs.readFileSync(htmlPath, 'utf8');

const catalogLiteral =
  'const CATALOG_PRODUCT_IMGS=' +
  JSON.stringify(catalog) +
  ';\n' +
  'function applyCatalogProductImgs(){\n' +
  '  const map=CATALOG_PRODUCT_IMGS||{};\n' +
  '  const ov=loadPimgOverrides();\n' +
  '  let changed=false;\n' +
  '  Object.keys(map).forEach(code=>{\n' +
  '    const url=map[code]; if(!url) return;\n' +
  '    PIMG[String(code)]=url;\n' +
  '    PIMG[String(code).toUpperCase()]=url;\n' +
  '    PIMG[String(code).toLowerCase()]=url;\n' +
  "    ['',String(code),String(code).toUpperCase(),String(code).toLowerCase()].forEach(k=>{\n" +
  '      if(!k) return; if(ov[k]){ delete ov[k]; changed=true; }\n' +
  '    });\n' +
  '  });\n' +
  '  if(changed){ try{ localStorage.setItem(PIMG_OVERRIDE_KEY, JSON.stringify(ov)); }catch(e){} }\n' +
  '  try{\n' +
  "    ['panels','inverters','batteries','cabinets','lights','pumps','accessories','mounts','cables'].forEach(k=>{\n" +
  '      (DB[k]||[]).forEach(o=>{\n' +
  '        if(!o||!o.code) return;\n' +
  '        const u=map[o.code]||map[String(o.code).toUpperCase()]||map[String(o.code).toLowerCase()];\n' +
  '        if(u) o.img=u;\n' +
  '      });\n' +
  '    });\n' +
  '  }catch(e){}\n' +
  '}\n';

// Remove previous injection if re-run
s = s.replace(/\nconst CATALOG_PRODUCT_IMGS=\{[\s\S]*?\nfunction applyCatalogProductImgs\(\)\{[\s\S]*?\n\}\n/m, '\n');
s = s.replace(/\napplyCatalogProductImgs\(\);\n/g, '\n');

if (s.includes('const CATALOG_PRODUCT_IMGS=')) {
  console.log('Already has CATALOG_PRODUCT_IMGS — replacing block via marker');
}

const anchor = 'applyPimgOverrides();\n';
if (!s.includes(anchor)) throw new Error('anchor applyPimgOverrides(); not found');

// Insert function definition just before first applyPimgOverrides();
const firstCall = s.indexOf(anchor);
if (firstCall < 0) throw new Error('no first call');

// Put definition before loadPimgOverrides if present, else before first call
const defAnchor = 'function applyPimgOverrides(){';
const defAt = s.indexOf(defAnchor);
if (defAt < 0) throw new Error('applyPimgOverrides def missing');
s = s.slice(0, defAt) + catalogLiteral + s.slice(defAt);

// After every applyPimgOverrides(); also run catalog apply
s = s.replace(/applyPimgOverrides\(\);/g, 'applyPimgOverrides();\napplyCatalogProductImgs();');

// Avoid double if somehow already doubled
s = s.replace(/applyCatalogProductImgs\(\);\napplyCatalogProductImgs\(\);/g, 'applyCatalogProductImgs();');

fs.writeFileSync(htmlPath, s);
console.log('wired', Object.keys(catalog).length, 'codes');
console.log('calls', (s.match(/applyCatalogProductImgs\(\);/g) || []).length);

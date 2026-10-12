const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const repo = 'C:/Users/Administrator/Projects/erp-dien-mat-troi';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const srcDir = path.join(process.env.USERPROFILE, 'Downloads', 'ảnh sản phẩm web (8)');
if (!fs.existsSync(srcDir)) throw new Error('Missing source folder: ' + srcDir);
console.log('SRC', srcDir);

const rasterDir = path.join(repo, 'assets/product-src/_svg-extract/raster-batch8');
fs.mkdirSync(rasterDir, { recursive: true });
fs.mkdirSync(path.join(repo, 'assets/products/viet-nam'), { recursive: true });
fs.mkdirSync(path.join(repo, 'assets/products/leader'), { recursive: true });

// Shared chassis when one SVG maps to multiple SKUs
const groups = [
  {
    file: 'BZ, Z20.svg',
    pair: [
      ['BZ', 'assets/products/viet-nam/01-BZ.jpg'],
      ['Z20', 'assets/products/viet-nam/02-Z20.jpg'],
    ],
  },
  { file: 'CL.svg', pair: [['CL', 'assets/products/viet-nam/03-CL.jpg']] },
  { file: 'CU.svg', pair: [['CU', 'assets/products/viet-nam/04-CU.jpg']] },
  {
    file: 'KB35, KB30.svg',
    pair: [
      ['KB35', 'assets/products/viet-nam/05-KB35.jpg'],
      ['KB30', 'assets/products/viet-nam/06-KB30.jpg'],
    ],
  },
  { file: 'KD.svg', pair: [['KD', 'assets/products/viet-nam/07-KD.jpg']] },
  {
    file: 'KG35, KG30.svg',
    pair: [
      ['KG35', 'assets/products/viet-nam/08-KG35.jpg'],
      ['KG30', 'assets/products/viet-nam/09-KG30.jpg'],
    ],
  },
  {
    file: 'ki.svg',
    pair: [
      ['ki', 'assets/products/viet-nam/10-ki.jpg'],
      ['KI', 'assets/products/viet-nam/10-ki.jpg'],
    ],
  },
  { file: 'Kinox.svg', pair: [['Kinox', 'assets/products/viet-nam/11-Kinox.jpg']] },
  { file: 'KN.svg', pair: [['KN', 'assets/products/viet-nam/12-KN.jpg']] },
  { file: 'KS.svg', pair: [['KS', 'assets/products/viet-nam/13-KS.jpg']] },
  { file: 'KTD.svg', pair: [['KTD', 'assets/products/viet-nam/14-KTD.jpg']] },
  {
    file: 'M2100, MNR, M200.svg',
    pair: [
      ['M2100', 'assets/products/viet-nam/15-M2100.jpg'],
      ['MNR', 'assets/products/viet-nam/16-MNR.jpg'],
      ['M200', 'assets/products/viet-nam/17-M200.jpg'],
    ],
  },
  { file: 'M4200.svg', pair: [['M4200', 'assets/products/viet-nam/18-M4200.jpg']] },
  { file: 'MC4.svg', pair: [['MC4', 'assets/products/leader/01-MC4.jpg']] },
  { file: 'NR.svg', pair: [['NR', 'assets/products/viet-nam/19-NR.jpg']] },
  { file: 'RN.svg', pair: [['RN', 'assets/products/viet-nam/20-RN.jpg']] },
  { file: 'STT.svg', pair: [['STT', 'assets/products/viet-nam/21-STT.jpg']] },
];

function slug(name) {
  return name.replace(/[^\w.-]+/g, '_');
}
function pathToFileURL(p) {
  let s = path.resolve(p).replace(/\\/g, '/');
  if (!s.startsWith('/')) s = '/' + s;
  return 'file://' + encodeURI(s).replace(/#/g, '%23');
}

function rasterSvg(file) {
  const inPath = path.join(srcDir, file);
  if (!fs.existsSync(inPath)) throw new Error('Missing ' + file);
  const pngPath = path.join(rasterDir, slug(file) + '.png');
  const htmlPath = path.join(rasterDir, slug(file) + '.html');
  const html = `<!doctype html><html><head><meta charset=utf-8>
<style>html,body{margin:0;background:#fff;width:1080px;height:1080px;overflow:hidden}
img{width:1080px;height:1080px;object-fit:contain;display:block;background:#fff}</style></head>
<body><img src="${pathToFileURL(inPath)}"></body></html>`;
  fs.writeFileSync(htmlPath, html, 'utf8');
  const r = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1080,1080',
      '--virtual-time-budget=30000',
      `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath),
    ],
    { encoding: 'utf8', timeout: 180000 }
  );
  if (r.error) throw r.error;
  if (!fs.existsSync(pngPath) || fs.statSync(pngPath).size < 2000) {
    throw new Error('Raster failed ' + file + ' stderr=' + (r.stderr || '').slice(0, 400));
  }
  console.log('raster', file, fs.statSync(pngPath).size);
  return pngPath;
}

const manifest = { size: 1000, margin: 16, items: [] };
const codeToOut = {};

for (const g of groups) {
  const pngPath = rasterSvg(g.file);
  // For shared SVG with multiple codes wanting separate files: square-fill once then copy,
  // OR list all outs so square-fill writes all from same source.
  const outs = [...new Set(g.pair.map((p) => p[1]))];
  for (const o of outs) fs.mkdirSync(path.join(repo, path.dirname(o)), { recursive: true });
  for (const [code, out] of g.pair) codeToOut[code] = out;
  manifest.items.push({
    in: path.relative(repo, pngPath).replace(/\\/g, '/'),
    out: outs,
  });
}

const manifestPath = path.join(repo, 'assets/product-src/_svg-extract/manifest-batch8.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

execFileSync(
  'powershell',
  [
    '-NoProfile',
    '-File',
    path.join(repo, '.cursor/skills/product-catalog-images/scripts/square-fill.ps1'),
    '-Manifest',
    manifestPath,
  ],
  { cwd: repo, stdio: 'inherit' }
);

const catalogPath = path.join(repo, 'assets/product-src/_svg-extract/catalog-map.json');
const catalog = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : {};
for (const [code, rel] of Object.entries(codeToOut)) catalog[code] = rel + '?v=10';
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('NEW', Object.keys(codeToOut).join(', '));
console.log('TOTAL', Object.keys(catalog).length);

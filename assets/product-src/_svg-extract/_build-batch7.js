const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const repo = 'C:/Users/Administrator/Projects/erp-dien-mat-troi';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const srcDir = path.join(process.env.USERPROFILE, 'Downloads', 'ảnh sản phẩm web (7)');
if (!fs.existsSync(srcDir)) throw new Error('Missing source folder: ' + srcDir);
console.log('SRC', srcDir);

const rasterDir = path.join(repo, 'assets/product-src/_svg-extract/raster-batch7');
fs.mkdirSync(rasterDir, { recursive: true });

const groups = [
  { file: 'BMSFLEX.svg', pair: [['BMSFLEX', 'assets/products/valley/07-BMSFLEX.jpg']] },
  {
    file: 'bmslux.svg',
    pair: [
      ['bmslux', 'assets/products/luxpower/33-bmslux.jpg'],
      ['BMSLUX', 'assets/products/luxpower/33-bmslux.jpg'],
    ],
  },
  { file: 'BMSX.svg', pair: [['BMSX', 'assets/products/solax/14-BMSX.jpg']] },
  { file: 'FLEX16.svg', pair: [['FLEX16', 'assets/products/valley/03-FLEX16.jpg']] },
  {
    file: 'lux5.svg',
    pair: [
      ['lux5', 'assets/products/luxpower/27-lux5.jpg'],
      ['LUX5', 'assets/products/luxpower/27-lux5.jpg'],
    ],
  },
  { file: 'X14.svg', pair: [['X14', 'assets/products/solax/05-X14.jpg']] },
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
  const outs = [...new Set(g.pair.map((p) => p[1]))];
  for (const o of outs) fs.mkdirSync(path.join(repo, path.dirname(o)), { recursive: true });
  for (const [code, out] of g.pair) codeToOut[code] = out;
  manifest.items.push({
    in: path.relative(repo, pngPath).replace(/\\/g, '/'),
    out: outs,
  });
}

const manifestPath = path.join(repo, 'assets/product-src/_svg-extract/manifest-batch7.json');
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
for (const [code, rel] of Object.entries(codeToOut)) catalog[code] = rel + '?v=9';
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('NEW', Object.keys(codeToOut).join(', '));
console.log('TOTAL', Object.keys(catalog).length);

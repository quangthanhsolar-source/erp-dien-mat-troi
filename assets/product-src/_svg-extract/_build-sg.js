const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const repo = 'C:/Users/Administrator/Projects/erp-dien-mat-troi';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const downloads = path.join(process.env.USERPROFILE, 'Downloads');
const srcDir = fs.readdirSync(downloads, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(downloads, d.name))
  .find((p) => {
    try {
      return fs.existsSync(path.join(p, 'SVE6.svg')) && / \(4\)$/.test(path.basename(p));
    } catch (e) {
      return false;
    }
  });
if (!srcDir) throw new Error('Source folder (4) not found');
console.log('SRC', srcDir);

const rasterDir = path.join(repo, 'assets/product-src/_svg-extract/raster-sg');
fs.mkdirSync(rasterDir, { recursive: true });

const groups = [
  {
    file: 'MG8, MG6, MG12, MG10, MG5.svg',
    pair: [
      ['MG8', 'assets/products/sungrow/07-MG8.jpg'],
      ['MG6', 'assets/products/sungrow/08-mg6.jpg'],
      ['mg6', 'assets/products/sungrow/08-mg6.jpg'],
      ['MG12', 'assets/products/sungrow/05-MG12.jpg'],
      ['MG10', 'assets/products/sungrow/06-MG10.jpg'],
      ['MG5', 'assets/products/sungrow/09-mg5.jpg'],
      ['mg5', 'assets/products/sungrow/09-mg5.jpg'],
    ],
  },
  {
    file: 'SG125, SG150.svg',
    pair: [
      ['sg125', 'assets/products/sungrow/01-sg125.jpg'],
      ['SG125', 'assets/products/sungrow/01-sg125.jpg'],
      ['sg150', 'assets/products/sungrow/02-sg150.jpg'],
      ['SG150', 'assets/products/sungrow/02-sg150.jpg'],
    ],
  },
  {
    file: 'SG33.svg',
    pair: [
      ['sg33', 'assets/products/sungrow/03-sg33.jpg'],
      ['SG33', 'assets/products/sungrow/03-sg33.jpg'],
    ],
  },
  {
    file: 'SG50.svg',
    pair: [['SG50', 'assets/products/sungrow/04-SG50.jpg']],
  },
  {
    file: 'SVE6.svg',
    pair: [
      ['sve6', 'assets/products/sve/01-sve6.jpg'],
      ['SVE6', 'assets/products/sve/01-sve6.jpg'],
    ],
  },
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
  spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1080,1080',
      '--virtual-time-budget=12000',
      `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath),
    ],
    { encoding: 'utf8', timeout: 90000 }
  );
  if (!fs.existsSync(pngPath) || fs.statSync(pngPath).size < 2000) throw new Error('Raster failed ' + file);
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

const manifestPath = path.join(repo, 'assets/product-src/_svg-extract/manifest-sg.json');
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
for (const [code, rel] of Object.entries(codeToOut)) catalog[code] = rel + '?v=7';
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('NEW', Object.keys(codeToOut).join(', '));
console.log('TOTAL', Object.keys(catalog).length);

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
      return fs.existsSync(path.join(p, 'SL99.svg')) && / \(3\)$/.test(path.basename(p));
    } catch (e) {
      return false;
    }
  });
if (!srcDir) throw new Error('Source folder (3) not found');
console.log('SRC', srcDir);

const rasterDir = path.join(repo, 'assets/product-src/_svg-extract/raster-solis');
fs.mkdirSync(rasterDir, { recursive: true });

const groups = [
  {
    file: 'S15, SL16, SL12, SL6, S18, SL14, SL8, S10, S8, S12, SL5.svg',
    pair: [
      ['S15', 'assets/products/solis/04-S15.jpg'],
      ['SL16', 'assets/products/solis/11-SL16.jpg'],
      ['SL12', 'assets/products/solis/09-SL12.jpg'],
      ['SL6', 'assets/products/solis/07-SL6.jpg'],
      ['S18', 'assets/products/solis/05-S18.jpg'],
      ['SL14', 'assets/products/solis/10-SL14.jpg'],
      ['SL8', 'assets/products/solis/08-SL8.jpg'],
      ['S10', 'assets/products/solis/02-S10.jpg'],
      ['S8', 'assets/products/solis/01-S8.jpg'],
      ['S12', 'assets/products/solis/03-S12.jpg'],
      ['SL5', 'assets/products/solis/06-SL5.jpg'],
    ],
  },
  {
    file: 'SL125.svg',
    pair: [
      ['sl125', 'assets/products/solis/13-sl125.jpg'],
      ['SL125', 'assets/products/solis/13-sl125.jpg'],
    ],
  },
  {
    file: 'SL80, SL110.svg',
    pair: [
      ['SL80', 'assets/products/solis/14-SL80.jpg'],
      ['SL110', 'assets/products/solis/15-SL110.jpg'],
    ],
  },
  {
    file: 'SL99.svg',
    pair: [['SL99', 'assets/products/solis/12-SL99.jpg']],
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

const manifestPath = path.join(repo, 'assets/product-src/_svg-extract/manifest-solis.json');
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
for (const [code, rel] of Object.entries(codeToOut)) catalog[code] = rel + '?v=6';
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('NEW', Object.keys(codeToOut).join(', '));
console.log('TOTAL', Object.keys(catalog).length);

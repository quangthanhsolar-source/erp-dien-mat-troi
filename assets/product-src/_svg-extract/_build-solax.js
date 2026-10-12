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
      return fs.existsSync(path.join(p, 'X6, X5.svg')) && / \(2\)$/.test(path.basename(p));
    } catch (e) {
      return false;
    }
  });
if (!srcDir) throw new Error('Source folder (2) not found');
console.log('SRC', srcDir);

const rasterDir = path.join(repo, 'assets/product-src/_svg-extract/raster-solax');
fs.mkdirSync(rasterDir, { recursive: true });

const groups = [
  {
    file: 'NEO10, NEO20, NEO15, X8, X10, X12.svg',
    outs: [
      'assets/products/solax/06-NEO10.jpg',
      'assets/products/solax/07-NEO20.jpg',
      'assets/products/solax/08-NEO15.jpg',
      'assets/products/solax/09-X8.jpg',
      'assets/products/solax/10-X10.jpg',
      'assets/products/solax/11-X12.jpg',
    ],
    codes: ['NEO10', 'NEO20', 'NEO15', 'X8', 'X10', 'X12'],
  },
  {
    file: 'X49, X60.svg',
    outs: ['assets/products/solax/12-X49.jpg', 'assets/products/solax/13-X60.jpg'],
    codes: ['X49', 'X60'],
  },
  {
    file: 'X6, X5.svg',
    outs: ['assets/products/solax/02-X6.jpg', 'assets/products/solax/01-X5.jpg'],
    codes: ['X6', 'X5'],
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
  const uri = pathToFileURL(inPath);
  const html = `<!doctype html><html><head><meta charset=utf-8>
<style>html,body{margin:0;background:#fff;width:1080px;height:1080px;overflow:hidden}
img{width:1080px;height:1080px;object-fit:contain;display:block;background:#fff}</style></head>
<body><img src="${uri}"></body></html>`;
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
  if (!fs.existsSync(pngPath) || fs.statSync(pngPath).size < 2000) {
    throw new Error('Raster failed ' + file);
  }
  console.log('raster', file, fs.statSync(pngPath).size);
  return pngPath;
}

const manifest = { size: 1000, margin: 16, items: [] };
const codeToOut = {};

for (const g of groups) {
  const pngPath = rasterSvg(g.file);
  for (const o of g.outs) fs.mkdirSync(path.join(repo, path.dirname(o)), { recursive: true });
  g.codes.forEach((c, i) => {
    codeToOut[c] = g.outs[Math.min(i, g.outs.length - 1)];
  });
  manifest.items.push({
    in: path.relative(repo, pngPath).replace(/\\/g, '/'),
    out: g.outs,
  });
}

const manifestPath = path.join(repo, 'assets/product-src/_svg-extract/manifest-solax.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const ps1 = path.join(repo, '.cursor/skills/product-catalog-images/scripts/square-fill.ps1');
execFileSync('powershell', ['-NoProfile', '-File', ps1, '-Manifest', manifestPath], {
  cwd: repo,
  stdio: 'inherit',
});

const catalogPath = path.join(repo, 'assets/product-src/_svg-extract/catalog-map.json');
const prev = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : {};
const catalog = { ...prev };
for (const [code, rel] of Object.entries(codeToOut)) catalog[code] = rel + '?v=5';
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('NEW', Object.keys(codeToOut).join(', '));
console.log('TOTAL', Object.keys(catalog).length);

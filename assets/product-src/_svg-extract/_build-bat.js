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
      return fs.existsSync(path.join(p, 'FB16.svg')) && / \(5\)$/.test(path.basename(p));
    } catch (e) {
      return false;
    }
  });
if (!srcDir) throw new Error('Source folder (5) not found');
console.log('SRC', srcDir);

const rasterDir = path.join(repo, 'assets/product-src/_svg-extract/raster-bat');
fs.mkdirSync(rasterDir, { recursive: true });

const groups = [
  { file: 'FB16.svg', pair: [['FB16', 'assets/products/pylontech/01-FB16.jpg']] },
  { file: 'FLEX16.svg', pair: [['FLEX16', 'assets/products/valley/03-FLEX16.jpg']] },
  { file: 'HI14.svg', pair: [['HI14', 'assets/products/luxpower/25-HI14.jpg']] },
  {
    file: 'HI16.svg',
    pair: [
      ['hi16', 'assets/products/luxpower/26-hi16.jpg'],
      ['HI16', 'assets/products/luxpower/26-hi16.jpg'],
    ],
  },
  { file: 'HI5.svg', pair: [['HI5', 'assets/products/luxpower/22-HI5.jpg']] },
  { file: 'HIG5.svg', pair: [['HIG5', 'assets/products/luxpower/08-HIG5.jpg']] },
  { file: 'LD15.svg', pair: [['LD15', 'assets/products/solax/03-LD15.jpg']] },
  { file: 'LD16.svg', pair: [['LD16', 'assets/products/solax/04-LD16.jpg']] },
  {
    file: 'LI7.5.svg',
    pair: [
      ['Li7.5', 'assets/products/luxpower/23-Li7.5.jpg'],
      ['LI7.5', 'assets/products/luxpower/23-Li7.5.jpg'],
    ],
  },
  { file: 'MBL16.svg', pair: [['MBL16', 'assets/products/sungrow/10-MBL16.jpg']] },
  {
    file: 'SVE14.svg',
    pair: [
      ['sve14', 'assets/products/sve/02-sve14.jpg'],
      ['SVE14', 'assets/products/sve/02-sve14.jpg'],
    ],
  },
  {
    file: 'SVE16.6.svg',
    pair: [
      ['sve16.6', 'assets/products/sve/04-sve16.6.jpg'],
      ['SVE16.6', 'assets/products/sve/04-sve16.6.jpg'],
    ],
  },
  { file: 'SVE16.svg', pair: [['SVE16', 'assets/products/sve/03-SVE16.jpg']] },
  { file: 'VL10.svg', pair: [['VL10', 'assets/products/valley/04-VL10.jpg']] },
  { file: 'VL16.svg', pair: [['VL16', 'assets/products/valley/01-VL16.jpg']] },
  { file: 'VL21.svg', pair: [['VL21', 'assets/products/valley/05-VL21.jpg']] },
  { file: 'VL5.svg', pair: [['VL5', 'assets/products/valley/06-VL5.jpg']] },
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

const manifestPath = path.join(repo, 'assets/product-src/_svg-extract/manifest-bat.json');
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
for (const [code, rel] of Object.entries(codeToOut)) catalog[code] = rel + '?v=8';
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('NEW', Object.keys(codeToOut).join(', '));
console.log('TOTAL', Object.keys(catalog).length);

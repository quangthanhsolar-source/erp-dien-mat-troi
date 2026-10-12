const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const repo = 'C:/Users/Administrator/Projects/erp-dien-mat-troi';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const downloads = path.join(process.env.USERPROFILE, 'Downloads');
const srcDir = fs.readdirSync(downloads, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(downloads, d.name))
  .find((p) => fs.existsSync(path.join(p, 'IN3.svg')));
if (!srcDir) throw new Error('Source folder not found');

const rasterDir = path.join(repo, 'assets/product-src/_svg-extract/raster');
fs.mkdirSync(rasterDir, { recursive: true });

const groups = [
  { file: '620.svg', codes: ['620'], outs: ['assets/products/longi/01-620.jpg'] },
  { file: '626.svg', codes: ['626'], outs: ['assets/products/axitec/01-626.jpg'] },
  { file: '655, 625.svg', codes: ['655', '625'], outs: ['assets/products/tcl/02-655.jpg', 'assets/products/tcl/01-625.jpg'] },
  { file: 'IN101, IN20.svg', codes: ['IN101', 'IN20'], outs: ['assets/products/invt/12-IN101.jpg', 'assets/products/invt/14-IN20.jpg'] },
  { file: 'IN103, XD6.svg', codes: ['IN103', 'XD6'], outs: ['assets/products/invt/13-IN103.jpg', 'assets/products/invt/06-XD6.jpg'] },
  { file: 'IN110, IN125.svg', codes: ['IN110', 'IN125'], outs: ['assets/products/invt/16-IN110.jpg', 'assets/products/invt/17-IN125.jpg'] },
  { file: 'IN3.svg', codes: ['IN3'], outs: ['assets/products/invt/09-IN3.jpg'] },
  { file: 'IN30, IN5, IN15.svg', codes: ['IN30', 'IN5', 'IN15'], outs: ['assets/products/invt/08-IN30.jpg', 'assets/products/invt/03-IN5.jpg', 'assets/products/invt/01-IN15.jpg'] },
  { file: 'IN80, IN40, IN50, IN60.svg', codes: ['IN80', 'IN40', 'IN50', 'in50', 'IN60'], outs: ['assets/products/invt/04-IN80.jpg', 'assets/products/invt/10-IN40.jpg', 'assets/products/invt/11-in50.jpg', 'assets/products/invt/15-IN60.jpg'] },
  { file: 'XD10.svg', codes: ['XD10'], outs: ['assets/products/invt/07-XD10.jpg'] },
  { file: 'XD50, XD60.svg', codes: ['XD50', 'XD60'], outs: ['assets/products/invt/05-XD50.jpg', 'assets/products/invt/02-XD60.jpg'] },
];

function slug(name) {
  return name.replace(/[^\w.-]+/g, '_');
}

function rasterSvg(file) {
  const inPath = path.join(srcDir, file);
  const uri = pathToFileURL(inPath);
  const htmlPath = path.join(rasterDir, slug(file) + '.html');
  const pngPath = path.join(rasterDir, slug(file) + '.png');
  const html = `<!doctype html><html><head><meta charset=utf-8>
<style>html,body{margin:0;background:#fff;width:1080px;height:1080px;overflow:hidden}
img{width:1080px;height:1080px;object-fit:contain;display:block;background:#fff}</style></head>
<body><img src="${uri}"></body></html>`;
  fs.writeFileSync(htmlPath, html, 'utf8');
  const r = spawnSync(
    chrome,
    ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1080,1080', `--screenshot=${pngPath}`, pathToFileURL(htmlPath)],
    { encoding: 'utf8' }
  );
  if (!fs.existsSync(pngPath)) {
    throw new Error('Raster failed ' + file + ' ' + (r.stderr || r.stdout || ''));
  }
  console.log('raster', file, fs.statSync(pngPath).size);
  return pngPath;
}

function pathToFileURL(p) {
  let s = path.resolve(p).replace(/\\/g, '/');
  if (!s.startsWith('/')) s = '/' + s;
  return 'file://' + encodeURI(s).replace(/#/g, '%23');
}

const manifest = { size: 1000, margin: 16, items: [] };
const codeToOut = {};

for (const g of groups) {
  const pngPath = rasterSvg(g.file);
  for (const o of g.outs) fs.mkdirSync(path.join(repo, path.dirname(o)), { recursive: true });

  if (g.file === 'IN80, IN40, IN50, IN60.svg') {
    codeToOut.IN80 = g.outs[0];
    codeToOut.IN40 = g.outs[1];
    codeToOut.IN50 = g.outs[2];
    codeToOut.in50 = g.outs[2];
    codeToOut.IN60 = g.outs[3];
  } else if (g.file === '655, 625.svg') {
    codeToOut['655'] = g.outs[0];
    codeToOut['625'] = g.outs[1];
  } else {
    g.codes.forEach((c, i) => {
      codeToOut[c] = g.outs[Math.min(i, g.outs.length - 1)];
    });
  }

  manifest.items.push({
    in: path.relative(repo, pngPath).replace(/\\/g, '/'),
    out: g.outs,
  });
}

const manifestPath = path.join(repo, 'assets/product-src/_svg-extract/manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const ps1 = path.join(repo, '.cursor/skills/product-catalog-images/scripts/square-fill.ps1');
execFileSync('powershell', ['-NoProfile', '-File', ps1, '-Manifest', manifestPath], {
  cwd: repo,
  stdio: 'inherit',
});

const catalog = {};
for (const [code, rel] of Object.entries(codeToOut)) catalog[code] = rel + '?v=3';
fs.writeFileSync(path.join(repo, 'assets/product-src/_svg-extract/catalog-map.json'), JSON.stringify(catalog, null, 2));
console.log('CATALOG keys', Object.keys(catalog).sort().join(', '));

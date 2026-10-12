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
      return fs.existsSync(path.join(p, 'SNApro.svg')) && / \(1\)$/.test(path.basename(p));
    } catch (e) {
      return false;
    }
  });
if (!srcDir) throw new Error('Source folder "ảnh sản phẩm web (1)" not found');
console.log('SRC', srcDir);

const rasterDir = path.join(repo, 'assets/product-src/_svg-extract/raster-lux');
fs.mkdirSync(rasterDir, { recursive: true });

const groups = [
  {
    file: 'GEN10, GEN 3-8K.svg',
    outs: ['assets/products/luxpower/12-GEN10.jpg', 'assets/products/luxpower/11-GEN8.jpg'],
    codes: ['GEN10', 'GEN8'],
  },
  {
    file: 'L20, L12, GEN12, GEN14, L15, TR30.svg',
    outs: [
      'assets/products/luxpower/21-L20.jpg',
      'assets/products/luxpower/19-L12.jpg',
      'assets/products/luxpower/28-GEN12.jpg',
      'assets/products/luxpower/29-GEN14.jpg',
      'assets/products/luxpower/20-L15.jpg',
      'assets/products/luxpower/18-TR30.jpg',
    ],
    codes: ['L20', 'L12', 'GEN12', 'GEN14', 'L15', 'TR30'],
  },
  { file: 'LXP12.svg', outs: ['assets/products/luxpower/13-LXP12.jpg'], codes: ['LXP12'] },
  { file: 'LXP6.svg', outs: ['assets/products/luxpower/10-LXP6.jpg'], codes: ['LXP6'] },
  {
    file: 'SNA10, SNA14.svg',
    outs: ['assets/products/luxpower/30-sna10.jpg', 'assets/products/luxpower/31-sna14.jpg'],
    codes: ['sna10', 'SNA10', 'sna14', 'SNA14'],
    map: { sna10: 0, SNA10: 0, sna14: 1, SNA14: 1 },
  },
  {
    file: 'SNA12.svg',
    outs: ['assets/products/luxpower/32-sna12.jpg'],
    codes: ['sna12', 'SNA12'],
    map: { sna12: 0, SNA12: 0 },
  },
  {
    file: 'SNA6, SNA5.svg',
    outs: ['assets/products/luxpower/03-SNA6.jpg', 'assets/products/luxpower/02-SNA5.jpg'],
    codes: ['SNA6', 'SNA5'],
  },
  {
    file: 'SNApro.svg',
    outs: ['assets/products/luxpower/01-SNAPro.jpg'],
    codes: ['SNAPro', 'snapro', 'SNApro'],
    map: { SNAPro: 0, snapro: 0, SNApro: 0 },
  },
  {
    file: 'TR25, TR10, TR15, TR20.svg',
    outs: [
      'assets/products/luxpower/17-tr25.jpg',
      'assets/products/luxpower/14-TR10.jpg',
      'assets/products/luxpower/15-TR15.jpg',
      'assets/products/luxpower/16-TR20.jpg',
    ],
    codes: ['tr25', 'TR25', 'TR10', 'TR15', 'TR20'],
    map: { tr25: 0, TR25: 0, TR10: 1, TR15: 2, TR20: 3 },
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

function extractLargestPng(svgText, outPng) {
  const re = /data:image\/png;base64,([A-Za-z0-9+/=]+)/g;
  let m;
  let best = null;
  while ((m = re.exec(svgText))) {
    if (!best || m[1].length > best.length) best = m[1];
  }
  if (!best) return false;
  fs.writeFileSync(outPng, Buffer.from(best, 'base64'));
  return true;
}

function rasterSvg(file) {
  const inPath = path.join(srcDir, file);
  if (!fs.existsSync(inPath)) throw new Error('Missing ' + file);
  const pngPath = path.join(rasterDir, slug(file) + '.png');
  const size = fs.statSync(inPath).size;
  // Huge composite SVG: prefer chrome; if >4MB try chrome with longer wait, fallback extract
  const uri = pathToFileURL(inPath);
  const htmlPath = path.join(rasterDir, slug(file) + '.html');
  const html = `<!doctype html><html><head><meta charset=utf-8>
<style>html,body{margin:0;background:#fff;width:1080px;height:1080px;overflow:hidden}
img{width:1080px;height:1080px;object-fit:contain;display:block;background:#fff}</style></head>
<body><img id=i src="${uri}" onload="document.title='ready'" onerror="document.title='err'"></body></html>`;
  fs.writeFileSync(htmlPath, html, 'utf8');

  const r = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--window-size=1080,1080',
      '--virtual-time-budget=15000',
      `--screenshot=${pngPath}`,
      pathToFileURL(htmlPath),
    ],
    { encoding: 'utf8', timeout: 120000 }
  );

  if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 5000) {
    console.log('raster chrome', file, fs.statSync(pngPath).size, 'svgBytes=' + size);
    return pngPath;
  }

  const fallback = path.join(rasterDir, slug(file) + '.extract.png');
  const svgText = fs.readFileSync(inPath, 'utf8');
  if (!extractLargestPng(svgText, fallback)) {
    throw new Error('Raster failed ' + file + ' stderr=' + (r.stderr || '').slice(0, 300));
  }
  console.log('raster extract-fallback', file, fs.statSync(fallback).size);
  return fallback;
}

const manifest = { size: 1000, margin: 16, items: [] };
const codeToOut = {};

for (const g of groups) {
  const pngPath = rasterSvg(g.file);
  for (const o of g.outs) fs.mkdirSync(path.join(repo, path.dirname(o)), { recursive: true });

  if (g.map) {
    for (const [code, idx] of Object.entries(g.map)) codeToOut[code] = g.outs[idx];
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

const manifestPath = path.join(repo, 'assets/product-src/_svg-extract/manifest-lux.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const ps1 = path.join(repo, '.cursor/skills/product-catalog-images/scripts/square-fill.ps1');
execFileSync('powershell', ['-NoProfile', '-File', ps1, '-Manifest', manifestPath], {
  cwd: repo,
  stdio: 'inherit',
});

const catalogPath = path.join(repo, 'assets/product-src/_svg-extract/catalog-map.json');
const prev = fs.existsSync(catalogPath) ? JSON.parse(fs.readFileSync(catalogPath, 'utf8')) : {};
const catalog = { ...prev };
for (const [code, rel] of Object.entries(codeToOut)) catalog[code] = rel + '?v=4';
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log('NEW keys', Object.keys(codeToOut).sort().join(', '));
console.log('TOTAL catalog', Object.keys(catalog).length);

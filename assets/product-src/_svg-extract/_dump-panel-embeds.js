const fs = require('fs');
const path = require('path');

const downloads = path.join(process.env.USERPROFILE, 'Downloads');
const srcDir = fs.readdirSync(downloads, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(downloads, d.name))
  .find((p) => fs.existsSync(path.join(p, 'IN3.svg')));

const outDir = path.join(
  'C:/Users/Administrator/Projects/erp-dien-mat-troi/assets/product-src/_svg-extract/panel-embeds'
);
fs.mkdirSync(outDir, { recursive: true });

const files = ['620.svg', '626.svg', '655, 625.svg'];
for (const f of files) {
  const t = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const re = /data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/gi;
  let m;
  let i = 0;
  const slug = f.replace(/[^\w.-]+/g, '_').replace(/\.svg$/i, '');
  while ((m = re.exec(t))) {
    const ext = m[1].toLowerCase() === 'jpeg' || m[1].toLowerCase() === 'jpg' ? 'jpg' : m[1].toLowerCase();
    const buf = Buffer.from(m[2], 'base64');
    const name = `${slug}__${i}__${buf.length}.${ext}`;
    fs.writeFileSync(path.join(outDir, name), buf);
    console.log('wrote', name);
    i++;
  }
}

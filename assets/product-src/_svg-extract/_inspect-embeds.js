const fs = require('fs');
const path = require('path');

const downloads = path.join(process.env.USERPROFILE, 'Downloads');
const srcDir = fs.readdirSync(downloads, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(downloads, d.name))
  .find((p) => fs.existsSync(path.join(p, 'IN3.svg')));

const files = ['620.svg', '626.svg', '655, 625.svg', 'IN3.svg', 'XD10.svg'];
for (const f of files) {
  const t = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const re = /data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/gi;
  let m;
  const embeds = [];
  while ((m = re.exec(t))) {
    embeds.push({ type: m[1].toLowerCase(), len: m[2].length, bytes: Buffer.from(m[2], 'base64').length });
  }
  console.log('\n' + f + ' svgLen=' + t.length + ' embeds=' + embeds.length);
  embeds
    .sort((a, b) => b.len - a.len)
    .forEach((e, i) => console.log('  #' + i, e.type, 'b64=' + e.len, 'raw=' + e.bytes));
  // check for non-data images / hrefs
  const hrefs = [...t.matchAll(/(?:href|xlink:href)="([^"]{0,80})"/g)].map((x) => x[1]).slice(0, 8);
  console.log('  hrefs sample', hrefs);
}

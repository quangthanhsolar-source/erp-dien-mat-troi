const fs = require('fs');
const path = require('path');

const downloads = path.join(process.env.USERPROFILE, 'Downloads');
const srcDir = fs.readdirSync(downloads, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(downloads, d.name))
  .find((p) => fs.existsSync(path.join(p, 'IN3.svg')));

for (const f of ['620.svg', '626.svg', '655, 625.svg']) {
  const t = fs.readFileSync(path.join(srcDir, f), 'utf8');
  // strip base64 payloads for readability
  const clean = t.replace(/data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+/g, (m) => {
    return m.slice(0, 40) + '...LEN' + m.length;
  });
  console.log('\n==== ' + f + ' ====');
  console.log(clean.slice(0, 2500));
}

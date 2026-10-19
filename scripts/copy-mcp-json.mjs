import fs from 'fs';
const src = process.argv[2];
const dst = process.argv[3];
fs.copyFileSync(src, dst);
const j = JSON.parse(fs.readFileSync(dst, 'utf8'));
console.log('copied', dst, 'qlen', j.query.length);

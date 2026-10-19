import fs from 'fs';
import path from 'path';

const tag = process.argv[2];
if (!tag) {
  console.error('usage: node load-exec-json.mjs d01');
  process.exit(1);
}
const num = tag.replace(/^d/, '');
const jpath = path.join(
  'C:\\Users\\Administrator\\AppData\\Local\\Temp',
  `exec-d${num.padStart(2, '0')}.json`
);
process.stdout.write(fs.readFileSync(jpath, 'utf8'));

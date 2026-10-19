import fs from 'fs';
const j = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
fs.writeFileSync(process.argv[3], j.query, 'utf8');
console.log('wrote', process.argv[3], j.query.length);

import fs from 'fs';
const p = process.argv[2];
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
process.stdout.write(JSON.stringify({ project_id: j.project_id, query: j.query }));

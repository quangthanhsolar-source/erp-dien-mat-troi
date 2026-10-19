/** stdout: {project_id, query} from .sql or {project_id,query} json */
import fs from 'fs';
const file = process.argv[2];
const raw = fs.readFileSync(file, 'utf8');
let payload;
if (file.endsWith('.json')) payload = JSON.parse(raw);
else payload = { project_id: 'ceiuwiamqszmxmqtbemy', query: raw };
process.stdout.write(JSON.stringify(payload));

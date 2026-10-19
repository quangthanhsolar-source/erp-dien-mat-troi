/** Print {project_id, query} JSON to stdout from .json or .sql path (UTF-8). Agent: fs.readFileSync preferred; this avoids PS pipe on JSON args. */
import fs from 'fs';

const file = process.argv[2];
if (!file) {
  console.error('usage: node crm-mcp-load-query.mjs <path.json|.sql>');
  process.exit(1);
}
let project_id = 'ceiuwiamqszmxmqtbemy';
let query;
if (file.endsWith('.json')) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  project_id = j.project_id || project_id;
  query = j.query;
} else {
  query = fs.readFileSync(file, 'utf8');
}
process.stdout.write(JSON.stringify({ project_id, query }));

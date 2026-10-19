/**
 * Applies {project_id, query} JSON files via Supabase Management API.
 * Usage: node crm-mcp-apply-files.mjs file1.json file2.json ...
 */
import fs from 'fs';

const token =
  process.env.SUPABASE_ACCESS_TOKEN ||
  (() => {
    try {
      return fs.readFileSync(`${process.env.APPDATA}/supabase/access-token`, 'utf8').trim();
    } catch {
      return '';
    }
  })();

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node crm-mcp-apply-files.mjs <json...>');
  process.exit(1);
}
if (!token) {
  console.error('NO_TOKEN');
  process.exit(2);
}

for (const file of files) {
  const { project_id, query } = JSON.parse(fs.readFileSync(file, 'utf8'));
  const url = `https://api.supabase.com/v1/projects/${project_id}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error('FAIL', file, res.status, text.slice(0, 400));
    process.exit(1);
  }
  console.log('OK', file.replace(/\\/g, '/').split('/').pop(), query.length);
}

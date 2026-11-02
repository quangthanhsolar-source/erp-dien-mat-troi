#!/usr/bin/env node
/**
 * Free Firebase Hosting storage before deploy.
 * Uses the CI refresh token in FIREBASE_TOKEN (never printed).
 * Keeps the live release and drops older releases plus preview channels.
 */
const SITE = process.env.FIREBASE_HOSTING_SITE || 'quang-thanh-solar-erp';
const KEEP = 2;
const CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';
const API = 'https://firebasehosting.googleapis.com/v1beta1';

async function accessToken() {
  const refresh = process.env.FIREBASE_TOKEN || '';
  if (!refresh) throw new Error('Missing FIREBASE_TOKEN');
  if (refresh.startsWith('ya29.')) return refresh;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error('Could not refresh Firebase token (' + res.status + ')');
  }
  return json.access_token;
}

async function api(token, method, path, payload) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = { raw: text.slice(0, 300) }; }
  if (!res.ok) {
    const msg = (json && (json.error && json.error.message || json.error)) || res.status;
    const err = new Error(method + ' ' + path + ' -> ' + res.status + ' ' + msg);
    err.status = res.status;
    throw err;
  }
  return json;
}

async function listAll(token, path, field) {
  const out = [];
  let pageToken = '';
  do {
    const q = pageToken ? (path.includes('?') ? '&' : '?') + 'pageToken=' + encodeURIComponent(pageToken) : '';
    const json = await api(token, 'GET', path + q);
    out.push(...((json && json[field]) || []));
    pageToken = (json && json.nextPageToken) || '';
  } while (pageToken);
  return out;
}

async function main() {
  const token = await accessToken();
  const channel = await api(token, 'GET', '/sites/' + SITE + '/channels/live');
  const current = channel && channel.release && channel.release.name;
  console.log('live release:', current || '(none)');
  console.log('retainedReleaseCount was:', channel && channel.retainedReleaseCount);

  try {
    await api(token, 'PATCH', '/sites/' + SITE + '/channels/live?updateMask=retainedReleaseCount', {
      retainedReleaseCount: KEEP,
    });
    console.log('set retainedReleaseCount to', KEEP);
  } catch (e) {
    console.warn('could not set retention:', e.message);
  }

  const channels = await listAll(token, '/sites/' + SITE + '/channels?pageSize=100', 'channels');
  for (const ch of channels) {
    const name = ch.name || '';
    if (name.endsWith('/channels/live')) continue;
    try {
      await api(token, 'DELETE', '/' + name);
      console.log('deleted preview channel', name);
    } catch (e) {
      console.warn('channel delete failed', name, e.message);
    }
  }

  const releases = await listAll(token, '/sites/' + SITE + '/channels/live/releases?pageSize=100', 'releases');
  releases.sort((a, b) => String(b.createTime || '').localeCompare(String(a.createTime || '')));
  console.log('live-channel releases:', releases.length);
  let removed = 0;
  for (let i = 0; i < releases.length; i++) {
    const rel = releases[i];
    const name = rel.name || '';
    if (!name || name === current || i < KEEP) continue;
    try {
      await api(token, 'DELETE', '/' + name);
      removed++;
      console.log('deleted release', name);
    } catch (e) {
      console.warn('release delete failed', name, e.message);
    }
  }
  console.log('removed releases:', removed);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});

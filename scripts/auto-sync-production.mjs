#!/usr/bin/env node
/**
 * Auto-sync ERP edits → GitHub main → Firebase Hosting (app.quangthanhsolar.com)
 *
 * Flow: save file → debounce → commit + push main → firebase deploy
 * Then hard-refresh https://app.quangthanhsolar.com to see the new build.
 */
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEBOUNCE_MS = Number(process.env.SYNC_DEBOUNCE_MS || 8000);
const TOKEN_FILE = path.join(ROOT, ".firebase-ci-token");
const LOCK_FILE = path.join(ROOT, ".auto-sync.lock");
const LOG = (...args) => {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[auto-sync ${ts}]`, ...args);
};

const IGNORE_DIR = new Set([
  ".git",
  "node_modules",
  ".firebase",
  "android",
  "ios",
  "scripts/_",
  ".cursor/_",
]);
const IGNORE_FILE = (rel) => {
  if (!rel || rel === ".") return true;
  if (rel.startsWith(".git/") || rel.includes("/.git/")) return true;
  if (rel.startsWith("node_modules/") || rel.includes("/node_modules/")) return true;
  if (rel.startsWith("android/") || rel.startsWith("ios/")) return true;
  if (rel.startsWith(".firebase/")) return true;
  if (rel === ".auto-sync.lock" || rel === ".firebase-ci-token") return true;
  if (rel.startsWith("scripts/_") || rel.startsWith(".cursor/_")) return true;
  if (rel.endsWith(".log") || rel.endsWith(".bak") || rel.includes(".bak")) return true;
  if (rel === ".env" || rel.startsWith(".env.")) return true;
  return false;
};

function loadFirebaseToken() {
  if (process.env.FIREBASE_TOKEN) return process.env.FIREBASE_TOKEN.trim();
  try {
    return fs.readFileSync(TOKEN_FILE, "utf8").trim();
  } catch {
    return "";
  }
}

function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  });
}

function isSyncing() {
  try {
    const pid = Number(fs.readFileSync(LOCK_FILE, "utf8").trim());
    if (!pid) return false;
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function acquireLock() {
  if (isSyncing()) return false;
  fs.writeFileSync(LOCK_FILE, String(process.pid));
  return true;
}

function releaseLock() {
  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {
    /* ignore */
  }
}

function hasChanges() {
  const status = sh("git", ["status", "--porcelain"]);
  return status
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .some((line) => {
      const file = line.replace(/^[MADRCU?!\s]{1,2}\s+/, "").replace(/^.* -> /, "");
      return !IGNORE_FILE(file);
    });
}

function syncOnce(reason) {
  if (!acquireLock()) {
    LOG("skip (another sync in progress)");
    pending = true;
    return;
  }
  try {
    if (!hasChanges()) {
      LOG("no relevant changes", reason ? `(${reason})` : "");
      return;
    }

    LOG("changes detected → commit + push + deploy…");
    sh("git", ["add", "-A"]);
    // Unstage secrets / junk if any slipped in
    try {
      sh("git", ["reset", "-q", "HEAD", "--", ".firebase-ci-token", ".auto-sync.lock", ".env"]);
    } catch {
      /* ignore */
    }

    const porcelain = sh("git", ["status", "--porcelain"]).trim();
    if (!porcelain) {
      LOG("nothing to commit after staging filter");
      return;
    }

    const stamp = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const msg = `Auto-sync ERP edits to production (${stamp})`;
    sh("git", ["commit", "-m", msg]);
    sh("git", ["push", "origin", "main"]);
    LOG("pushed main → GitHub Actions will deploy");

    const token = loadFirebaseToken();
    if (token) {
      LOG("deploying Firebase Hosting directly (faster)…");
      sh(
        "npx",
        [
          "--yes",
          "firebase-tools",
          "deploy",
          "--only",
          "hosting",
          "--project",
          "quang-thanh-solar-erp",
          "--non-interactive",
          "--token",
          token,
        ],
        { stdio: "inherit", env: { ...process.env, FIREBASE_TOKEN: token } }
      );
      LOG("production live → https://app.quangthanhsolar.com  (Ctrl+F5)");
    } else {
      LOG("no FIREBASE_TOKEN locally — waiting for GitHub Actions (~1–3 min)");
      LOG("then Ctrl+F5 https://app.quangthanhsolar.com");
    }
  } catch (err) {
    const stderr = err?.stderr?.toString?.() || "";
    const stdout = err?.stdout?.toString?.() || "";
    LOG("sync failed:", err.message || err);
    if (stderr) LOG(stderr.slice(0, 800));
    if (stdout) LOG(stdout.slice(0, 400));
  } finally {
    releaseLock();
    if (pending) {
      pending = false;
      schedule("queued");
    }
  }
}

let timer = null;
let pending = false;

function schedule(reason) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => syncOnce(reason), DEBOUNCE_MS);
  LOG(`queued sync in ${DEBOUNCE_MS / 1000}s (${reason})`);
}

function watchDir(dir) {
  let watcher;
  try {
    watcher = fs.watch(dir, { recursive: true }, (event, filename) => {
      if (!filename) return;
      const rel = path.relative(ROOT, path.join(dir, filename)).replace(/\\/g, "/");
      const top = rel.split("/")[0];
      if (IGNORE_DIR.has(top)) return;
      if (IGNORE_FILE(rel)) return;
      schedule(`${event}:${rel}`);
    });
  } catch (err) {
    LOG("watch failed for", dir, err.message);
    return;
  }
  watcher.on("error", (err) => LOG("watcher error:", err.message));
}

// Persist token for future boots of this watcher
const envToken = process.env.FIREBASE_TOKEN?.trim();
if (envToken) {
  fs.writeFileSync(TOKEN_FILE, envToken, { mode: 0o600 });
  LOG("saved Firebase CI token to .firebase-ci-token (gitignored)");
}

LOG("watching", ROOT);
LOG(`debounce ${DEBOUNCE_MS}ms · save files in Cursor → auto push + deploy`);
LOG("then hard-refresh https://app.quangthanhsolar.com");
watchDir(ROOT);

// Keep process alive
setInterval(() => {}, 1 << 30);

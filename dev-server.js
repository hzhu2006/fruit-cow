#!/usr/bin/env node
/* ==========================================================================
   FRUIT COW  —  DEV SERVER
   Static file server that watches your files and reloads the browser.

   Edit assets/js/content.js, save, and the open page refreshes itself.

     node dev-server.js          → http://0.0.0.0:8000
     PORT=3000 node dev-server.js

   No dependencies, no build step.
   ========================================================================== */

"use strict";

const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8000;
const HOST = "0.0.0.0";
const WATCH = ["index.html", "assets"];

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

/* ------------------------------------------------------------ live reload */

let version = Date.now();
let versionTimer = null;

function bump(file) {
  version = Date.now();
  clearTimeout(versionTimer);
  // Debounce so one save that touches several files causes one reload.
  versionTimer = setTimeout(() => {
    process.stdout.write("  ↻ changed: " + path.relative(ROOT, file) + "\n");
  }, 30);
}

function watch(target) {
  const full = path.join(ROOT, target);
  if (!fs.existsSync(full)) return;
  try {
    fs.watch(full, { recursive: true }, (_event, filename) => {
      if (!filename) return bump(full);
      if (/\.(map|log)$/.test(filename)) return;
      bump(full);
    });
  } catch (err) {
    process.stdout.write("  ! could not watch " + target + ": " + err.message + "\n");
  }
}

const RELOAD_SNIPPET = `
<script>
(function () {
  var current = null;
  function poll() {
    fetch('/__fc_version', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (current === null) { current = data.v; return; }
        if (data.v !== current) { location.reload(); return; }
      })
      .catch(function () {});
  }
  setInterval(poll, 1000);
  poll();
})();
</script>`;

/* -------------------------------------------------------------- serving */

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const target = path.normalize(path.join(ROOT, decoded));
  // Refuse anything that escapes the project root.
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) return null;
  return target;
}

async function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ "Content-Length": Buffer.byteLength(body) }, headers || {}));
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url || "/";

  if (urlPath.startsWith("/__fc_version")) {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    });
    return res.end(JSON.stringify({ v: version }));
  }

  let target = safeJoin(urlPath);
  if (!target) return send(res, 403, "Forbidden", { "Content-Type": "text/plain" });

  try {
    const stat = await fsp.stat(target);
    if (stat.isDirectory()) target = path.join(target, "index.html");
  } catch (err) {
    return send(res, 404, "Not found: " + urlPath, { "Content-Type": "text/plain" });
  }

  let body;
  try {
    body = await fsp.readFile(target);
  } catch (err) {
    return send(res, 404, "Not found: " + urlPath, { "Content-Type": "text/plain" });
  }

  const ext = path.extname(target).toLowerCase();
  const type = TYPES[ext] || "application/octet-stream";

  // Inject the reload poller into HTML so edits show up without a manual refresh.
  if (ext === ".html") {
    const html = body.toString("utf8");
    const injected = html.includes("</body>")
      ? html.replace("</body>", RELOAD_SNIPPET + "\n</body>")
      : html + RELOAD_SNIPPET;
    return send(res, 200, injected, { "Content-Type": type, "Cache-Control": "no-store" });
  }

  send(res, 200, body, { "Content-Type": type, "Cache-Control": "no-store" });
});

WATCH.forEach(watch);

server.listen(PORT, HOST, () => {
  process.stdout.write("\n  Fruit Cow  →  http://localhost:" + PORT + "\n");
  process.stdout.write("  Watching " + WATCH.join(", ") + " — save a file and the page reloads.\n\n");
});

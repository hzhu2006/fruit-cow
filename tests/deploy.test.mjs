/* ==========================================================================
   FRUIT COW — DEPLOY PIPELINE TESTS
   Parses the real GitHub Actions workflow and checks it is wired correctly
   and that everything it ships actually exists on disk.
   ========================================================================== */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { load as yamlLoad } from "js-yaml";
import { ROOT } from "./helpers.mjs";

const WORKFLOW = path.join(ROOT, ".github", "workflows", "deploy.yml");

function loadWorkflow() {
  assert.ok(fs.existsSync(WORKFLOW), "expected .github/workflows/deploy.yml");
  return yamlLoad(fs.readFileSync(WORKFLOW, "utf8"));
}

test("deploy.yml is valid YAML", () => {
  const wf = loadWorkflow();
  assert.equal(typeof wf, "object");
  assert.ok(wf.jobs, "workflow declares jobs");
});

test("a push to main triggers the pipeline", () => {
  const wf = loadWorkflow();
  // YAML parses a bare `on:` key as the boolean true, so accept both.
  const on = wf.on ?? wf[true];
  assert.ok(on, "workflow has a trigger");
  assert.deepEqual(on.push.branches, ["main"]);
  // `workflow_dispatch:` with no body parses to null — the key is what matters.
  assert.ok("workflow_dispatch" in on, "can also be run by hand");
});

test("deploy waits for tests to pass", () => {
  const wf = loadWorkflow();
  assert.ok(wf.jobs.test, "has a test job");
  assert.ok(wf.jobs.deploy, "has a deploy job");
  // `needs: test` and `needs: [test]` are both valid Actions syntax.
  assert.deepEqual([].concat(wf.jobs.deploy.needs), ["test"]);

  const steps = wf.jobs.test.steps.map((s) => s.run || s.uses).filter(Boolean);
  assert.ok(steps.includes("npm ci"), "installs from the lockfile");
  assert.ok(steps.includes("npm test"), "runs the suite");
});

test("deploy targets GitHub Pages with the right permissions", () => {
  const wf = loadWorkflow();
  assert.equal(wf.permissions["id-token"], "write", "Pages deploy needs id-token: write");
  assert.equal(wf.permissions.pages, "write");
  assert.equal(wf.jobs.deploy.environment.name, "github-pages");

  const uses = wf.jobs.deploy.steps.map((s) => s.uses).filter(Boolean);
  assert.ok(uses.some((u) => u.startsWith("actions/upload-pages-artifact@")));
  assert.ok(uses.some((u) => u.startsWith("actions/deploy-pages@")));
});

test("only the site is shipped — not tests or node_modules", () => {
  const wf = loadWorkflow();
  const upload = wf.jobs.deploy.steps.find((s) => s.uses && s.uses.startsWith("actions/upload-pages-artifact@"));
  assert.equal(upload.with.path, "_site");

  const assemble = wf.jobs.deploy.steps.find((s) => s.name === "Assemble static site");
  assert.ok(assemble, "workflow assembles _site");
  assert.ok(assemble.run.includes("cp index.html _site/"));
  assert.ok(assemble.run.includes("cp -r assets _site/"));
  assert.ok(!assemble.run.includes("cp -r tests"), "tests are not published");
  assert.ok(!assemble.run.includes("node_modules"), "dependencies are not published");

  // Everything the workflow copies must exist in the repo.
  assert.ok(fs.existsSync(path.join(ROOT, "index.html")), "index.html exists");
  assert.ok(fs.existsSync(path.join(ROOT, "assets")), "assets/ exists");
});

test("the page references no build output the workflow does not ship", () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const referenced = [...html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)].map((m) => m[1]);

  // Anything with a path must live under assets/ (or be the shipped index.html).
  referenced.forEach((ref) => {
    if (ref.startsWith("http") || ref.startsWith("mailto:")) return;
    assert.ok(
      ref.startsWith("assets/") || ref.endsWith("styles.css"),
      "unexpected shipped path in index.html: " + ref
    );
    const onDisk = path.join(ROOT, ref);
    // The logo and hero are intentional drop-in slots that do not exist yet.
    if (ref.endsWith(".png")) return;
    assert.ok(fs.existsSync(onDisk), "index.html references a missing file: " + ref);
  });

  assert.ok(referenced.includes("assets/js/cart.js"), "cart.js is loaded by the page");
});

test("dev server watches the files an owner actually edits", () => {
  const server = fs.readFileSync(path.join(ROOT, "dev-server.js"), "utf8");
  assert.ok(server.includes('"index.html"'), "watches index.html");
  assert.ok(server.includes('"assets"'), "watches assets/ (content.js lives there)");
  assert.ok(server.includes("/__fc_version"), "exposes the version endpoint the poller reads");
  assert.ok(server.includes('0.0.0.0'), "binds all interfaces so previews work");
});

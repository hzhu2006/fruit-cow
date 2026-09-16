/* ==========================================================================
   FRUIT COW — THEME TESTS
   The wood/natural look is driven by CSS custom properties and a small set of
   decorative SVGs. These check the tokens are there, the decorations exist,
   and the values section is genuinely data-driven.
   ========================================================================== */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT, bootPage, own } from "./helpers.mjs";

const CSS = fs.readFileSync(path.join(ROOT, "assets/css/styles.css"), "utf8");
const HTML = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const DECOR = [
  "assets/img/deco-mango.svg",
  "assets/img/deco-citrus.svg",
  "assets/img/deco-leaf.svg",
  "assets/img/texture-grain.svg"
];

test("palette tokens define wood, paper, mango and botanical ranges", () => {
  [
    "--wood-900", "--wood-800", "--wood-700", "--wood-300",
    "--cream", "--linen", "--line",
    "--mango", "--mango-deep", "--mango-soft", "--citrus",
    "--leaf", "--leaf-deep", "--leaf-soft",
    "--ink", "--ink-soft"
  ].forEach((token) => {
    assert.ok(CSS.includes(token + ":"), "missing palette token " + token);
  });
});

test("type pairs a display serif with a clean sans", () => {
  assert.ok(CSS.includes("--font-display:"), "has a display font token");
  assert.ok(CSS.includes("--font-body:"), "has a body font token");
  assert.ok(CSS.includes("Fraunces"), "display face is Fraunces");
  assert.ok(CSS.includes("Inter"), "body face is Inter");
  // Must degrade gracefully when the webfonts cannot load.
  assert.ok(CSS.includes("Georgia"), "serif stack falls back to Georgia");
  assert.ok(CSS.includes("system-ui"), "sans stack falls back to system-ui");
  assert.ok(HTML.includes("fonts.googleapis.com"), "index.html loads the webfonts");
  assert.ok(HTML.includes("family=Fraunces"), "Fraunces is requested");
});

test("decorative SVGs exist, are valid SVG and are not empty", () => {
  DECOR.forEach((rel) => {
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), "missing decoration " + rel);
    const svg = fs.readFileSync(file, "utf8");
    assert.ok(svg.includes("<svg"), rel + " is not an <svg> document");
    assert.ok(svg.includes("</svg>"), rel + " is not closed");
    assert.ok(svg.length > 200, rel + " looks empty");
  });
});

test("grain texture is applied over the page", () => {
  assert.ok(CSS.includes("texture-grain.svg"), "body uses the grain texture");
  assert.ok(/body::before/.test(CSS), "grain is layered via body::before");
  assert.ok(CSS.includes("pointer-events: none"), "grain never blocks clicks");
});

test("wood grain is used on the dark bands", () => {
  const custom = CSS.slice(CSS.indexOf(".fc-custom {"), CSS.indexOf(".fc-custom__grid"));
  assert.ok(custom.includes("repeating-linear-gradient"), "customizations band has wood grain");
  assert.ok(custom.includes("--wood-800"), "customizations band is dark wood");

  const footer = CSS.slice(CSS.indexOf(".fc-footer {"), CSS.indexOf(".fc-footer__inner"));
  assert.ok(footer.includes("repeating-linear-gradient"), "footer has wood grain");
  assert.ok(footer.includes("--wood-900"), "footer is the darkest wood");
});

test("the values strip renders from content.js", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const cards = document.querySelectorAll(".fc-value");
  assert.equal(cards.length, c.values.length, "one card per value");

  c.values.forEach((v, i) => {
    assert.equal(cards[i].querySelector(".fc-value__title").textContent, v.title);
    assert.equal(cards[i].querySelector(".fc-value__body").textContent, v.body);
    assert.equal(cards[i].querySelector(".fc-value__icon").getAttribute("src"), v.icon);
    // Every icon referenced must actually exist on disk.
    assert.ok(fs.existsSync(path.join(ROOT, v.icon)), "value icon missing: " + v.icon);
  });
  dom.window.close();
});

test("deleting `values` from content.js removes the strip entirely", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  assert.ok(document.querySelector(".fc-values"), "strip present to start with");
  delete c.values;
  FruitCow.boot();
  assert.equal(document.querySelector(".fc-values"), null, "strip gone");
  assert.ok(document.querySelector(".fc-card"), "rest of the page still renders");
  dom.window.close();
});

test("hero fruit decoration is ornamental and hidden from screen readers", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  const decor = document.querySelectorAll(".fc-decor");
  assert.ok(decor.length >= 2, "hero carries decorative fruit");
  decor.forEach((img) => {
    assert.equal(img.getAttribute("aria-hidden"), "true");
    assert.equal(img.getAttribute("alt"), "", "decorative images need empty alt");
    assert.ok(img.getAttribute("src").endsWith(".svg"));
  });
  dom.window.close();
});

test("the accent colour stays decorative, not the primary action", async () => {
  // Brand intent: mango/citrus decorate; the primary CTA is botanical green.
  const primary = CSS.slice(CSS.indexOf(".fc-btn--primary"), CSS.indexOf(".fc-btn--ghost"));
  assert.ok(primary.includes("--leaf"), "primary button uses the botanical green");
  assert.ok(!primary.includes("--mango"), "primary button is not mango");

  const count = CSS.slice(CSS.indexOf(".fc-cartbtn__count {"), CSS.indexOf(".fc-cartbtn__count[hidden]"));
  assert.ok(count.includes("--mango"), "mango is used as a small accent");
});

test("copy in content.js reflects the natural, premium positioning", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c } = dom.window;

  assert.ok(/natural/i.test(c.business.tagline), "tagline signals natural");
  assert.ok(/nothing artificial/i.test(c.hero.heading), "hero states the no-artificial promise");
  assert.ok(c.values.length >= 3, "at least three proof points");

  const titles = own(c.values.map((v) => v.title));
  titles.forEach((t) => assert.ok(t && t.length > 3, "every value needs a real title"));
  assert.equal(new Set(titles).size, titles.length, "value titles must be distinct");
  dom.window.close();
});

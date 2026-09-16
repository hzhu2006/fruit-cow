/* ==========================================================================
   FRUIT COW — THEME TESTS
   Chinese ink wash over wood. These check the palette tokens, that every
   piece of artwork referenced from content.js actually exists, that the wood
   patterns really land on the drink options and menu cards, and that the
   cinnabar stays an accent rather than taking over.
   ========================================================================== */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT, bootPage, own } from "./helpers.mjs";

const CSS = fs.readFileSync(path.join(ROOT, "assets/css/styles.css"), "utf8");
const HTML = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const INK_ART = [
  "assets/img/ink-bamboo.svg",
  "assets/img/ink-plum.svg",
  "assets/img/ink-mountain.svg",
  "assets/img/ink-mango.svg",
  "assets/img/ink-stroke.svg",
  "assets/img/seal.svg",
  "assets/img/texture-grain.svg"
];

const WOOD = [
  "assets/img/pattern-wood-oak.svg",
  "assets/img/pattern-wood-walnut.svg"
];

/** Pull one rule block out of the stylesheet by selector. */
function rule(selector, endMarker) {
  const start = CSS.indexOf(selector);
  assert.ok(start !== -1, "stylesheet has no rule for " + selector);
  return CSS.slice(start, endMarker ? CSS.indexOf(endMarker, start) : start + 900);
}

/* ------------------------------------------------------------------ palette */

test("palette covers paper, ink, cinnabar, brass and wood", () => {
  [
    "--paper:", "--paper-2:", "--linen:", "--line:",
    "--ink:", "--ink-2:", "--ink-soft:",
    "--cinnabar:", "--cinnabar-soft:", "--cinnabar-wash:",
    "--brass:", "--brass-soft:",
    "--wood-deep:", "--wood:", "--wood-mid:"
  ].forEach((token) => {
    assert.ok(CSS.includes(token), "missing palette token " + token);
  });
});

test("type pairs a display serif with a clean sans and degrades offline", () => {
  assert.ok(CSS.includes("--font-display:"));
  assert.ok(CSS.includes("--font-body:"));
  assert.ok(CSS.includes("Fraunces"), "display face is Fraunces");
  assert.ok(CSS.includes("Inter"), "body face is Inter");
  assert.ok(CSS.includes("Georgia"), "serif stack falls back to Georgia");
  assert.ok(CSS.includes("system-ui"), "sans stack falls back to system-ui");
  assert.ok(HTML.includes("family=Fraunces"), "index.html requests Fraunces");
});

/* ----------------------------------------------------------------- artwork */

test("every ink drawing exists, is valid SVG and has real content", () => {
  INK_ART.forEach((rel) => {
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), "missing artwork " + rel);
    const svg = fs.readFileSync(file, "utf8");
    assert.ok(svg.includes("<svg"), rel + " is not an <svg> document");
    assert.ok(svg.includes("</svg>"), rel + " is not closed");
    assert.ok(svg.length > 300, rel + " looks empty");
    assert.ok(!/[^\x00-\x7F]/.test(svg.replace(/aria-label="[^"]*"/g, "").replace(/<!--[\s\S]*?-->/g, "")),
      rel + " has a stray non-ASCII character outside labels/comments");
  });
});

test("both wood patterns exist and are tileable SVGs", () => {
  WOOD.forEach((rel) => {
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), "missing wood pattern " + rel);
    const svg = fs.readFileSync(file, "utf8");
    assert.ok(svg.includes("<svg"), rel + " is not an <svg> document");
    assert.ok(svg.includes("feTurbulence"), rel + " should build grain with feTurbulence");
    // A tile needs explicit dimensions so background-repeat lines up.
    assert.ok(/width="\d+"/.test(svg) && /height="\d+"/.test(svg), rel + " needs width/height to tile");
  });
});

test("rice-paper tooth is laid over the page without blocking clicks", () => {
  assert.ok(CSS.includes("texture-grain.svg"));
  assert.ok(/body::before/.test(CSS));
  assert.ok(CSS.includes("pointer-events: none"));
});

/* --------------------------------------------------------- wood on surfaces */

test("wood patterns are exposed as CSS variables content.js can override", () => {
  assert.ok(CSS.includes("--fc-card-wood:"));
  assert.ok(CSS.includes("--fc-options-wood:"));
  assert.ok(CSS.includes("pattern-wood-oak.svg"), "cards default to oak");
  assert.ok(CSS.includes("pattern-wood-walnut.svg"), "options default to walnut");
});

test("the drink-option panels actually carry the walnut pattern", () => {
  const optgroup = rule(".fc-optgroup {", ".fc-optgroup__title");
  assert.ok(optgroup.includes("var(--fc-options-wood)"), "option panels use the wood variable");
  assert.ok(optgroup.includes("background-size"), "pattern is sized to tile");
  // A dark veil must sit over the grain so the text stays legible.
  assert.ok(/linear-gradient\(rgba\(30, 22, 16/.test(optgroup), "grain sits under a dark veil");
});

test("menu cards carry the oak pattern under a linen veil", () => {
  const card = rule(".fc-card {", ".fc-card:hover");
  assert.ok(card.includes("var(--fc-card-wood)"), "cards use the wood variable");
  assert.ok(/linear-gradient\(rgba\(252, 250, 244/.test(card), "grain sits under a light veil");
});

/* ------------------------------------------------------- content.js decor */

test("every artwork path in content.decor points at a file that exists", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c } = dom.window;

  assert.ok(c.decor, "content.js has a decor block");
  const entries = Object.entries(c.decor);
  assert.ok(entries.length >= 6, "decor block covers the main slots");

  entries.forEach(([key, src]) => {
    assert.ok(src, "decor." + key + " is set");
    assert.ok(fs.existsSync(path.join(ROOT, src)), "decor." + key + " points at a missing file: " + src);
  });

  assert.ok(c.decor.optionsWood.includes("walnut"), "drink options get walnut");
  assert.ok(c.decor.cardWood.includes("oak"), "cards get oak");
  dom.window.close();
});

test("blanking a decor entry switches that artwork off", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  assert.ok(document.querySelector(".fc-seal"), "seal present to start");
  assert.ok(document.querySelector(".fc-divider"), "brush divider present");
  assert.ok(document.querySelector(".fc-menu__ridge"), "menu ridge present");

  c.decor.seal = "";
  c.decor.menuAccent = "";
  FruitCow.boot();

  assert.equal(document.querySelector(".fc-seal"), null, "seal gone");
  assert.equal(document.querySelector(".fc-menu__ridge"), null, "ridge gone");
  assert.ok(document.querySelector(".fc-divider"), "divider untouched");
  assert.ok(document.querySelector(".fc-card"), "page still renders");
  dom.window.close();
});

test("hero ink artwork is ornamental and hidden from assistive tech", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const decor = document.querySelectorAll(".fc-decor");
  assert.equal(decor.length, 2, "two hero drawings");
  decor.forEach((img) => {
    assert.equal(img.getAttribute("aria-hidden"), "true");
    assert.equal(img.getAttribute("alt"), "");
  });
  const srcs = [...decor].map((i) => i.getAttribute("src"));
  assert.ok(srcs.includes(c.decor.heroArt));
  assert.ok(srcs.includes(c.decor.heroAccent));
  dom.window.close();
});

test("the seal sits with the brand mark", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;
  const seal = document.querySelector(".fc-brand .fc-seal");
  assert.ok(seal, "seal renders inside the brand link");
  assert.equal(seal.getAttribute("src"), c.decor.seal);
  dom.window.close();
});

/* ------------------------------------------------------------ restraint */

test("cinnabar stays an accent; the primary action is ink", () => {
  const primary = rule(".fc-btn--primary", ".fc-btn--ghost");
  assert.ok(primary.includes("var(--ink)"), "primary button is ink");
  assert.ok(!/background:\s*var\(--cinnabar\)/.test(primary.split(":hover")[0]),
    "cinnabar is not the resting primary colour");

  // Cinnabar should appear, but only in small doses.
  const seal = rule(".fc-seal", ".fc-divider");
  assert.ok(seal.length > 0, "seal is styled");
  assert.ok(CSS.includes("--cinnabar"), "cinnabar is in the palette");
});

test("brass carries the money, not cinnabar", () => {
  const price = rule(".fc-prices__value {", ".fc-prices__value--lg");
  assert.ok(price.includes("var(--brass)"), "prices are set in brass");
  assert.ok(!price.includes("--cinnabar"), "prices are not cinnabar");
});

/* ------------------------------------------------------------- positioning */

test("the values strip renders from content.js with ink icons", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const cards = document.querySelectorAll(".fc-value");
  assert.equal(cards.length, c.values.length);

  c.values.forEach((v, i) => {
    assert.equal(cards[i].querySelector(".fc-value__title").textContent, v.title);
    assert.equal(cards[i].querySelector(".fc-value__body").textContent, v.body);
    assert.equal(cards[i].querySelector(".fc-value__icon").getAttribute("src"), v.icon);
    assert.ok(fs.existsSync(path.join(ROOT, v.icon)), "value icon missing: " + v.icon);
  });
  dom.window.close();
});

test("deleting `values` removes the strip without breaking the page", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  assert.ok(document.querySelector(".fc-values"));
  delete c.values;
  FruitCow.boot();
  assert.equal(document.querySelector(".fc-values"), null);
  assert.ok(document.querySelector(".fc-card"), "menu still renders");
  dom.window.close();
});

test("copy reflects the natural, premium positioning", async () => {
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

/* ==========================================================================
   FRUIT COW — THEME TESTS
   Dark wood print, indigo/orange complementary, rice and terraced fields,
   curves throughout, plus the Instagram and WeChat placeholders.
   ========================================================================== */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT, bootPage, own } from "./helpers.mjs";

const CSS = fs.readFileSync(path.join(ROOT, "assets/css/styles.css"), "utf8");
const HTML = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const ART = [
  "assets/img/ink-bamboo.svg",
  "assets/img/ink-plum.svg",
  "assets/img/ink-rice.svg",
  "assets/img/ink-mango.svg",
  "assets/img/ink-lychee.svg",
  "assets/img/ink-citrus.svg",
  "assets/img/ink-peach.svg",
  "assets/img/ink-terraces.svg",
  "assets/img/ink-woodring.svg",
  "assets/img/curve-wave.svg",
  "assets/img/seal.svg",
  "assets/img/sticker-rice.svg",
  "assets/img/sticker-citrus.svg",
  "assets/img/sticker-lychee.svg",
  "assets/img/logo-emblem.svg",
  "assets/img/deco-cow.svg",
  "assets/img/icon-instagram.svg",
  "assets/img/icon-wechat.svg",
  "assets/img/texture-grain.svg"
];

const PATTERNS = [
  "assets/img/pattern-wood-oak.svg",
  "assets/img/pattern-wood-walnut.svg",
  "assets/img/pattern-wood-dark.svg",
  "assets/img/pattern-rice.svg",
  "assets/img/pattern-woodring.svg",
  "assets/img/pattern-grass.svg"
];

/** Pull one rule block out of the stylesheet by selector. */
function rule(selector, endMarker) {
  const start = CSS.indexOf(selector);
  assert.ok(start !== -1, "stylesheet has no rule for " + selector);
  return CSS.slice(start, endMarker ? CSS.indexOf(endMarker, start) : start + 900);
}

/* ------------------------------------------------------------------ palette */

test("palette covers dark wood, paper, and the indigo/orange pair", () => {
  [
    "--wood-black:", "--wood-deep:", "--wood-dark:", "--wood:", "--wood-mid:", "--wood-warm:",
    "--paper:", "--paper-2:", "--linen:", "--line:",
    "--indigo:", "--indigo-deep:", "--indigo-ink:", "--indigo-soft:",
    "--orange:", "--orange-deep:", "--orange-soft:"
  ].forEach((token) => {
    assert.ok(CSS.includes(token), "missing palette token " + token);
  });
});

test("indigo and orange are genuinely complementary, not near-neighbours", () => {
  const hex = (name) => {
    const m = CSS.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*#([0-9a-f]{6})"));
    assert.ok(m, name + " is not a hex colour");
    return m[1];
  };
  const hue = (h) => {
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (!d) return 0;
    let x;
    if (max === r) x = ((g - b) / d) % 6;
    else if (max === g) x = (b - r) / d + 2;
    else x = (r - g) / d + 4;
    return (x * 60 + 360) % 360;
  };
  const blue = hue(hex("--indigo:"));
  const orange = hue(hex("--orange:"));
  const gap = Math.abs(blue - orange);
  const distance = Math.min(gap, 360 - gap);
  assert.ok(distance > 120 && distance < 240,
    `indigo (${blue.toFixed(0)}deg) and orange (${orange.toFixed(0)}deg) should sit opposite, got ${distance.toFixed(0)}deg apart`);
});

test("the wider blue and yellow families are defined", () => {
  [
    "--turquoise:", "--turquoise-deep:", "--turquoise-soft:",
    "--azure:", "--azure-soft:", "--slate:",
    "--saffron:", "--amber:", "--straw:", "--gold:", "--gold-soft:"
  ].forEach((token) => {
    assert.ok(CSS.includes(token), "missing palette token " + token);
  });
  // The extras must actually be used, not just declared.
  ["--turquoise", "--saffron", "--gold", "--azure"].forEach((token) => {
    const uses = CSS.split(token).length - 1;
    assert.ok(uses >= 2, token + " is declared but never used (" + uses + " occurrence)");
  });
});

test("the logo's palette is carried into the theme", () => {
  // Sky, meadow grass, the grass contour lines and the wordmark brown.
  [
    ["--sky", "#a9d4d1"],
    ["--grass", "#d6cf63"],
    ["--grass-soft", "#e9e5a4"],
    ["--grass-deep", "#7a6a22"],
    ["--brand-brown", "#a8501a"]
  ].forEach(([token, hex]) => {
    assert.ok(CSS.includes(token + ":"), "missing logo token " + token);
    assert.ok(CSS.toLowerCase().includes(hex.toLowerCase()),
      token + " should keep the logo's own value " + hex);
    const uses = CSS.split("var(" + token + ")").length - 1;
    assert.ok(uses >= 2, token + " is declared but never used (" + uses + " uses)");
  });
});

test("type pairs a display serif with a clean sans and degrades offline", () => {
  assert.ok(CSS.includes("--font-display:"));
  assert.ok(CSS.includes("--font-body:"));
  assert.ok(CSS.includes("Fraunces"));
  assert.ok(CSS.includes("Inter"));
  assert.ok(CSS.includes("Georgia"), "serif falls back to Georgia");
  assert.ok(CSS.includes("system-ui"), "sans falls back to system-ui");
  assert.ok(HTML.includes("family=Fraunces"));
});

/* ----------------------------------------------------------------- artwork */

test("every drawing exists, is valid SVG and has no stray characters", () => {
  ART.forEach((rel) => {
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), "missing artwork " + rel);
    const svg = fs.readFileSync(file, "utf8");
    assert.ok(svg.includes("<svg"), rel + " is not an <svg> document");
    assert.ok(svg.includes("</svg>"), rel + " is not closed");
    assert.ok(svg.length > 250, rel + " looks empty");
    const code = svg.replace(/aria-label="[^"]*"/g, "").replace(/<!--[\s\S]*?-->/g, "");
    assert.ok(!/[^\x00-\x7F]/.test(code), rel + " has a stray non-ASCII character");
  });
});

test("every pattern exists and is tileable", () => {
  PATTERNS.forEach((rel) => {
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), "missing pattern " + rel);
    const svg = fs.readFileSync(file, "utf8");
    assert.ok(/width="\d+"/.test(svg) && /height="\d+"/.test(svg), rel + " needs width/height to tile");
  });

  // The straight-grain prints build their texture procedurally.
  ["pattern-wood-oak.svg", "pattern-wood-walnut.svg", "pattern-wood-dark.svg"].forEach((rel) => {
    assert.ok(fs.readFileSync(path.join(ROOT, "assets/img/" + rel), "utf8").includes("feTurbulence"),
      rel + " should build grain with feTurbulence");
  });

  // The end-grain print is drawn as concentric rings instead — filters would
  // break the tile seam, so it uses corner-centred ellipses.
  const ring = fs.readFileSync(path.join(ROOT, "assets/img/pattern-woodring.svg"), "utf8");
  assert.ok(ring.includes("<ellipse"), "end grain is drawn with rings");
  assert.ok(!ring.includes("feDisplacementMap"), "end grain must not warp, or the tile would not seam");
});

/* ------------------------------------------------------------- logo motifs */

test("the logo's meadow band carries its swirling grass pattern", () => {
  const values = rule(".fc-values {", ".fc-values__grid");
  assert.ok(values.includes("var(--fc-grass-pattern)"), "values band uses the grass variable");
  assert.ok(values.includes("var(--grass)"), "values band sits on the meadow colour");
  assert.ok(values.includes("background-size"), "grass is sized to tile");

  const app = fs.readFileSync(path.join(ROOT, "assets/js/app.js"), "utf8");
  assert.ok(app.includes('"grassPattern", "--fc-grass-pattern"'),
    "boot hands the grass pattern from decor to CSS");
});

test("the grass tile keeps the logo's swirls and tufts", () => {
  const grass = fs.readFileSync(path.join(ROOT, "assets/img/pattern-grass.svg"), "utf8");
  assert.ok(grass.includes("#d6cf63"), "tile uses the logo's meadow green");
  assert.ok(grass.includes("#7a6a22"), "contour lines use the logo's olive");
  // tufts are drawn as upright ovals, swirls as small arcs
  assert.ok(/<ellipse[^>]*ry="1[0-9]"/.test(grass), "upright tufts are drawn as ovals");
  assert.ok(grass.match(/<path/g).length >= 6, "flowing contour lines are drawn");
  assert.ok(!grass.includes("feDisplacementMap"), "the tile must not warp, or it would not seam");
});

test("the emblem is the stand-in mark and fills the cover slot", () => {
  const content = fs.readFileSync(path.join(ROOT, "assets/js/content.js"), "utf8");
  // The original artwork is primary; the vector emblem is the shipped stand-in.
  assert.ok(/logo:\s*"assets\/img\/fruit-cow-logo\.jpg"/.test(content),
    "business.logo points at the original artwork");
  assert.ok(/logoFallback:\s*"assets\/img\/logo-emblem\.svg"/.test(content),
    "the emblem is the brand stand-in");
  assert.ok(/image:\s*"assets\/img\/fruit-cow-logo\.jpg"/.test(content),
    "the cover slot shows the original artwork");
  assert.ok(/imageFallback:\s*"assets\/img\/logo-emblem\.svg"/.test(content),
    "the emblem is the cover stand-in");

  const emblem = fs.readFileSync(path.join(ROOT, "assets/img/logo-emblem.svg"), "utf8");
  assert.ok(emblem.includes("<circle"), "emblem is a circular badge, like the logo");
  ["#a9d4d1", "#d6cf63", "#8a4a22"].forEach((hex) => {
    assert.ok(emblem.toLowerCase().includes(hex), "emblem keeps the logo colour " + hex);
  });
  assert.ok(emblem.includes("clipPath"), "sky and meadow are clipped to the badge");
});

test("the wordmark wears the logo's brown", () => {
  const name = rule(".fc-brand__name {", "}");
  assert.ok(name.includes("var(--brand-brown)"), "wordmark uses the logo's brown");
  const logo = rule(".fc-slot--logo {", "}");
  assert.ok(logo.includes("var(--brand-brown)"), "the emblem frame echoes the logo's ring");
});

/* ---------------------------------------------------------- wood on surfaces */

test("the cover is laid on the dark wood print", () => {
  const hero = rule(".fc-hero {", ".fc-hero::after");
  assert.ok(hero.includes("var(--fc-cover-wood)"), "cover uses the dark wood variable");
  assert.ok(hero.includes("--wood-deep"), "cover base colour is deep wood");
  assert.ok(hero.includes("background-size"), "wood is sized to tile");
  assert.ok(CSS.includes("pattern-wood-dark.svg"), "dark wood pattern is the default");
});

test("the drink-option panels carry walnut grain under a legible veil", () => {
  const optgroup = rule(".fc-optgroup {", ".fc-optgroup__title");
  assert.ok(optgroup.includes("var(--fc-options-wood)"), "option panels use the wood variable");
  assert.ok(optgroup.includes("background-size"), "grain is sized to tile");
  assert.ok(/linear-gradient\(rgba\(30, 20, 10/.test(optgroup), "grain sits under a dark veil");
});

test("menu cards carry oak grain under a linen veil", () => {
  const card = rule(".fc-card {", ".fc-card:hover");
  assert.ok(card.includes("var(--fc-card-wood)"));
  assert.ok(/linear-gradient\(rgba\(253, 249, 240/.test(card), "grain sits under a light veil");
});

test("the wood cross section is printed behind the locations band", () => {
  // The values band became the meadow, so the end grain carries locations now.
  const loc = rule(".fc-locations {", ".fc-locations .fc-shell");
  assert.ok(loc.includes("var(--fc-ring-pattern)"), "locations band uses the end-grain print");

  assert.ok(CSS.includes("pattern-woodring.svg"), "end-grain pattern is the default");
  const ring = fs.readFileSync(path.join(ROOT, "assets/img/pattern-woodring.svg"), "utf8");
  // Corner-centred rings are what make the tile seamless.
  assert.ok(ring.includes('transform="translate(400 0)"'), "rings are centred on the corners so it tiles");
});

test("stickers render into the areas content.js asks for", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  c.decor.stickers.forEach((s) => {
    const placed = document.querySelector(".fc-sticker--" + s.area);
    assert.ok(placed, "expected a sticker in the " + s.area + " area");
  });

  const rendered = [...document.querySelectorAll(".fc-sticker")];
  assert.equal(rendered.length, c.decor.stickers.length, "one sticker per entry");
  rendered.forEach((img) => {
    assert.equal(img.getAttribute("aria-hidden"), "true", "stickers are ornamental");
    assert.equal(img.getAttribute("alt"), "");
    assert.ok(img.getAttribute("style").includes("rotate"), "rotation comes from content.js");
  });
  dom.window.close();
});

test("removing the sticker list clears them all", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  assert.ok(document.querySelector(".fc-sticker"));
  c.decor.stickers = [];
  FruitCow.boot();
  assert.equal(document.querySelector(".fc-sticker"), null);
  assert.ok(document.querySelector(".fc-card"), "page still renders");
  dom.window.close();
});

test("rice grains are scattered over the page paper", () => {
  assert.ok(/body\s*{[\s\S]*?var\(--fc-rice-pattern\)/.test(CSS), "body uses the rice pattern");
  assert.ok(CSS.includes("pattern-rice.svg"), "rice pattern is the default");
  assert.ok(CSS.includes("background-attachment: fixed"), "grain stays put while scrolling");
});

/* ------------------------------------------------------------- curves */

test("the curve language is applied consistently", () => {
  const arches = [
    [".fc-card {", ".fc-card:hover", "96px 96px"],
    [".fc-value {", ".fc-value:hover", "130px 130px"],
    [".fc-loc {", ".fc-loc__name", "96px 96px"],
    [".fc-optgroup {", ".fc-optgroup__title", "78px 78px"]
  ];
  arches.forEach(([sel, end, radius]) => {
    assert.ok(rule(sel, end).includes(radius), sel + " should have an arched top (" + radius + ")");
  });

  assert.ok(rule(".fc-custom {", ".fc-custom .fc-section-title").includes("60px 60px 0 0"),
    "the customizations band has a curved crown");
  assert.ok(rule(".fc-footer {", ".fc-footer__inner").includes("60px 60px 0 0"),
    "the footer has a curved crown");
  assert.ok(rule(".fc-btn {", ".fc-btn--primary").includes("999px"), "buttons are pills");
  assert.ok(rule(".fc-qty__btn {", ".fc-qty__n").includes("50%"), "quantity buttons are circles");
  assert.ok(/\.fc-hero::after[\s\S]*?border-radius: 50% 50% 0 0/.test(CSS),
    "the cover flows into the page on a curved foot");
});

/* ------------------------------------------------------- content.js decor */

test("every artwork path in content.decor resolves to a real file", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c } = dom.window;

  assert.ok(c.decor, "content.js has a decor block");
  const entries = Object.entries(c.decor).filter(([k]) => k !== "stickers");
  assert.ok(entries.length >= 10, "decor block covers the main slots");
  entries.forEach(([key, src]) => {
    assert.ok(src, "decor." + key + " is set");
    assert.ok(fs.existsSync(path.join(ROOT, src)), "decor." + key + " points at a missing file: " + src);
  });
  assert.ok(c.decor.coverWood.includes("wood-dark"), "cover gets the dark print");
  assert.ok(c.decor.optionsWood.includes("walnut"), "drink options get walnut");
  assert.ok(c.decor.ringPattern.includes("woodring"), "end-grain print is wired");
  assert.ok(c.decor.terraces.includes("terraces"), "terraces slot is wired");
  dom.window.close();
});

test("every sticker points at a real file and names a valid area", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c } = dom.window;

  const stickers = c.decor.stickers;
  assert.ok(Array.isArray(stickers) && stickers.length >= 3, "sticker list is populated");

  const areas = ["cover", "values", "menu", "locations"];
  stickers.forEach((s, i) => {
    assert.ok(s.src, "sticker[" + i + "] needs a src");
    assert.ok(fs.existsSync(path.join(ROOT, s.src)), "sticker[" + i + "] is a missing file: " + s.src);
    assert.ok(areas.includes(s.area), "sticker[" + i + "] has an unknown area: " + s.area);
    assert.equal(typeof s.rotate, "number", "sticker[" + i + "] rotate must be a number of degrees");
  });

  const hasRice = stickers.some((s) => s.src.includes("rice"));
  assert.ok(hasRice, "the rice sticker the brief asked for is in use");
  dom.window.close();
});

test("blanking a decor entry switches that artwork off", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  assert.ok(document.querySelector(".fc-seal"), "seal present to start");
  assert.ok(document.querySelector(".fc-terraces"), "terraces present");

  c.decor.seal = "";
  c.decor.terraces = "";
  FruitCow.boot();

  assert.equal(document.querySelector(".fc-seal"), null, "seal gone");
  assert.equal(document.querySelector(".fc-terraces"), null, "terraces gone");
  assert.ok(document.querySelector(".fc-card"), "page still renders");
  dom.window.close();
});

test("hero artwork and terraces are ornamental and hidden from assistive tech", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const ornamental = [...document.querySelectorAll(".fc-decor, .fc-terraces, .fc-slice")];
  assert.ok(ornamental.length >= 4, "hero carries drawings, terraces and the timber slice");
  ornamental.forEach((img) => {
    assert.equal(img.getAttribute("aria-hidden"), "true");
    assert.equal(img.getAttribute("alt"), "");
  });
  assert.equal(document.querySelector(".fc-terraces").getAttribute("src"), c.decor.terraces);
  dom.window.close();
});

/* ------------------------------------------------------------- social */

test("Instagram and WeChat render in the header", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const links = document.querySelectorAll(".fc-header .fc-social .fc-social__link");
  assert.equal(links.length, c.business.social.length);

  const instagram = c.business.social.find((s) => s.id === "instagram");
  const wechat = c.business.social.find((s) => s.id === "wechat");
  assert.ok(instagram && wechat, "both platforms are configured");

  const labels = [...links].map((l) => l.getAttribute("aria-label"));
  assert.ok(labels.some((l) => l.includes("Instagram")));
  assert.ok(labels.some((l) => l.includes("WeChat")));

  // Instagram has a URL so it links out; WeChat has none so it is a plain span.
  const instaLink = [...links].find((l) => l.tagName === "A");
  assert.equal(instaLink.getAttribute("href"), instagram.url);
  assert.equal(instaLink.getAttribute("rel"), "noopener", "external links need rel=noopener");
  assert.ok([...links].some((l) => l.tagName === "SPAN"), "a handle with no url renders as a span");
  dom.window.close();
});

test("the footer shows handles and a WeChat QR drop-in slot", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const block = document.querySelector(".fc-socialblock");
  assert.ok(block, "footer has a social block");
  assert.equal(block.querySelectorAll(".fc-socialblock__item").length, c.business.social.length);

  const handles = [...block.querySelectorAll(".fc-socialblock__handle")].map((h) => h.textContent);
  c.business.social.forEach((s) => {
    assert.ok(handles.includes(s.handle), "handle shown for " + s.label);
  });

  const wechat = c.business.social.find((s) => s.qr);
  assert.ok(wechat, "one platform offers a QR");
  const qr = block.querySelector(".fc-img--qr, .fc-slot--qr");
  assert.ok(qr, "QR slot renders");
  const src = qr.tagName === "IMG" ? qr.getAttribute("src") : qr.querySelector("code").textContent;
  assert.ok(src.endsWith(wechat.qr), "QR slot points at the drop-in path");
  dom.window.close();
});

test("the QR slot names the exact file to drop in when the image is missing", async () => {
  const dom = await bootPage();
  const { document, FruitCow } = dom.window;

  const img = FruitCow.imageWithFallback("assets/img/wechat-qr.png", "WeChat QR code", "qr");
  document.body.appendChild(img);
  img.dispatchEvent(new dom.window.Event("error"));

  const slot = document.querySelector(".fc-slot--qr");
  assert.ok(slot, "placeholder replaces the missing QR");
  assert.equal(slot.querySelector("code").textContent, "assets/img/wechat-qr.png");
  dom.window.close();
});

test("deleting the social block removes it everywhere", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  assert.ok(document.querySelector(".fc-social"));
  delete c.business.social;
  FruitCow.boot();
  assert.equal(document.querySelector(".fc-social"), null);
  assert.equal(document.querySelector(".fc-socialblock"), null);
  assert.ok(document.querySelector(".fc-card"), "page still renders");
  dom.window.close();
});

/* ------------------------------------------------------------- restraint */

test("orange is the action colour, indigo carries the data", () => {
  const primary = rule(".fc-btn--primary", ".fc-btn--ghost");
  assert.ok(primary.includes("var(--orange)"), "primary button is orange");
  assert.ok(!primary.includes("--indigo"), "primary button is not indigo");

  const price = rule(".fc-prices__value {", ".fc-prices__value--lg");
  assert.ok(price.includes("var(--indigo-deep)"), "prices are set in indigo");
  assert.ok(!price.includes("--orange"), "prices are not orange");
});

/* ------------------------------------------------------------- positioning */

test("the values strip renders from content.js with ink icons", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const cards = document.querySelectorAll(".fc-value");
  assert.equal(cards.length, c.values.length);
  c.values.forEach((v, i) => {
    assert.equal(cards[i].querySelector(".fc-value__title").textContent, v.title);
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
  assert.ok(document.querySelector(".fc-card"));
  dom.window.close();
});

test("copy reflects the natural, premium positioning", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c } = dom.window;
  assert.ok(/natural/i.test(c.business.tagline));
  assert.ok(/nothing artificial/i.test(c.hero.heading));
  assert.ok(c.values.length >= 3);
  const titles = own(c.values.map((v) => v.title));
  assert.equal(new Set(titles).size, titles.length, "value titles must be distinct");
  dom.window.close();
});

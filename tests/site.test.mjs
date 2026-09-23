/* ==========================================================================
   FRUIT COW — TESTS
   Run with:  npm test
   These boot the REAL index.html with the REAL content.js and app.js
   (no mocks, no copies of the logic) and assert the page comes out right.
   ========================================================================== */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT, bootPage, own } from "./helpers.mjs";

/* --------------------------------------------------------------- pure logic */

test("shipped content.js passes its own validation contract", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT, FruitCow } = dom.window;

  assert.ok(SITE_CONTENT, "SITE_CONTENT should be defined by content.js");
  assert.ok(FruitCow, "FruitCow should be defined by app.js");
  assert.deepEqual(own(FruitCow.validateContent(SITE_CONTENT)), []);
  dom.window.close();
});

test("formatPrice renders currency and ignores non-numbers", async () => {
  const dom = await bootPage();
  const { FruitCow } = dom.window;
  assert.equal(FruitCow.formatPrice(6.5), "$6.50");
  assert.equal(FruitCow.formatPrice(6.5, "£"), "£6.50");
  assert.equal(FruitCow.formatPrice(4), "$4.00");
  assert.equal(FruitCow.formatPrice(undefined), "");
  assert.equal(FruitCow.formatPrice("6.50"), "");
  dom.window.close();
});

test("sizeOptions handles both per-size prices and single prices", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCow } = dom.window;
  const sizes = c.customizations.sizes;

  const multi = c.menu.find((m) => m.name === "Classic Black Milk Tea");
  assert.deepEqual(own(FruitCow.sizeOptions(multi, sizes)).map((o) => o.price), [4.5, 5.25, 6.0]);
  assert.equal(FruitCow.fromPrice(multi, sizes), 4.5);

  const single = c.menu.find((m) => m.name === "Egg Waffle");
  assert.deepEqual(own(FruitCow.sizeOptions(single, sizes)), [
    { id: null, label: null, detail: null, price: 5.5 }
  ]);

  // A drink that omits a size must not render an empty price row.
  const noSmall = c.menu.find((m) => m.name === "Mango Slush");
  assert.deepEqual(own(FruitCow.sizeOptions(noSmall, sizes)).map((o) => o.id), ["M", "L"]);

  assert.deepEqual(own(FruitCow.sizeOptions({})), []);
  dom.window.close();
});

test("filterMenu and groupByCategory drive the category chips", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCow } = dom.window;

  assert.equal(FruitCow.filterMenu(c.menu, {}).length, c.menu.length);
  assert.equal(
    FruitCow.filterMenu(c.menu, { category: "milktea" }).length,
    c.menu.filter((m) => m.category === "milktea").length
  );
  assert.equal(FruitCow.filterMenu(c.menu, { query: "matcha" }).length, 2);
  assert.equal(FruitCow.filterMenu(c.menu, { category: "milktea", query: "matcha" }).length, 1);
  assert.equal(FruitCow.filterMenu(c.menu, { query: "zzzznotathing" }).length, 0);

  const groups = FruitCow.groupByCategory(c.menu, c.categories);
  assert.deepEqual(
    groups.map((g) => g.category.id),
    c.categories.map((c2) => c2.id),
    "groups keep the order declared in categories[]"
  );
  // featured items sort to the front of their group
  const milktea = groups.find((g) => g.category.id === "milktea");
  assert.equal(milktea.items[0].name, "Classic Black Milk Tea");
  dom.window.close();
});

test("validateContent catches the mistakes a hand edit would make", async () => {
  const dom = await bootPage();
  const { FruitCow } = dom.window;

  const broken = {
    business: { name: "X" },
    categories: [{ id: "a", name: "A" }],
    customizations: { sizes: [{ id: "M", label: "Medium" }] },
    menu: [
      { name: "Bad category", category: "nope", price: 5 },
      { name: "String price", category: "a", price: "5.50" },
      { name: "Unknown size", category: "a", prices: { XL: 5 } },
      { category: "a", price: 5 }
    ]
  };
  const problems = own(FruitCow.validateContent(broken));
  assert.equal(problems.length, 4);
  assert.ok(problems.some((p) => p.includes('category "nope" is not in categories[]')));
  assert.ok(problems.some((p) => p.includes("prices.XL is not a size id (have: M)")));
  assert.ok(problems.some((p) => p.includes("(unnamed): missing name")));
  assert.ok(
    problems.some((p) => p.includes('`price` must be a number with no quotes or $, got "5.50"')),
    "a quoted price should be called out specifically, got: " + JSON.stringify(problems)
  );
  dom.window.close();
});

/* --------------------------------------------------------------- rendered */

test("the real page renders every menu item from content.js", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  assert.equal(document.title, c.business.name + " — " + c.business.tagline);
  assert.equal(document.querySelector(".fc-brand__name").textContent, c.business.name);

  const cards = document.querySelectorAll(".fc-card");
  assert.equal(cards.length, c.menu.length, "one card per menu item");

  c.menu.forEach((item) => {
    const names = [...cards].map((card) => card.querySelector(".fc-card__name").textContent);
    assert.ok(names.some((n) => n.includes(item.name)), `expected a card for "${item.name}"`);
  });

  assert.equal(document.querySelectorAll(".fc-group").length, c.categories.length);
  assert.equal(document.querySelectorAll(".fc-chip").length, c.categories.length + 1); // + "All"
  dom.window.close();
});

test("multi-size drinks show every price; single-price items show one", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const card = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Classic Black Milk Tea")
  );
  const rows = [...card.querySelectorAll(".fc-prices__row")];
  assert.equal(rows.length, 3);
  assert.deepEqual(
    rows.map((r) => r.querySelector(".fc-prices__value").textContent),
    ["$4.50", "$5.25", "$6.00"]
  );

  const waffle = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Egg Waffle")
  );
  assert.equal(waffle.querySelector(".fc-prices__value").textContent, "$5.50");
  assert.equal(waffle.querySelectorAll(".fc-prices__row").length, 0);

  const soldOut = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Peach Blossom Tea")
  );
  assert.ok(soldOut.classList.contains("fc-card--out"));
  dom.window.close();
});

test("search box filters the rendered cards live", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  const search = document.getElementById("fc-search");
  const visible = () => [...document.querySelectorAll(".fc-card")].filter((c) => !c.hidden).length;

  assert.equal(visible(), 15);

  // 3 hits, not 2: search matches descriptions too, and "Mochi Bites"
  // describes itself as "Choose mango, strawberry or matcha".
  search.value = "mango";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(visible(), 3);
  assert.equal(document.getElementById("fc-empty").hidden, true);

  search.value = "zzzznotathing";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(visible(), 0);
  assert.equal(document.getElementById("fc-empty").hidden, false);

  search.value = "";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(visible(), 15);
  dom.window.close();
});

test("category chip narrows the menu and hides empty groups", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const chip = [...document.querySelectorAll(".fc-chip")].find((b) => b.dataset.cat === "milktea");
  chip.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

  const visibleGroups = [...document.querySelectorAll(".fc-group")].filter((g) => !g.hidden);
  assert.equal(visibleGroups.length, 1);
  assert.equal(visibleGroups[0].id, "cat-milktea");
  assert.equal(
    visibleGroups[0].querySelectorAll(".fc-card:not([hidden])").length,
    c.menu.filter((m) => m.category === "milktea").length
  );

  const all = [...document.querySelectorAll(".fc-chip")].find((b) => b.dataset.cat === "all");
  all.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  assert.equal([...document.querySelectorAll(".fc-card")].filter((x) => !x.hidden).length, 15);
  dom.window.close();
});

test("topping and milk add-on prices come straight from content.js", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const boba = c.customizations.toppings.find((t) => t.id === "boba");
  const cream = c.customizations.toppings.find((t) => t.id === "cream");
  const text = document.getElementById("customize").textContent;
  assert.ok(text.includes(boba.label));
  assert.ok(text.includes("+$" + boba.addPrice.toFixed(2)));
  assert.ok(text.includes("+$" + cream.addPrice.toFixed(2)));
  assert.ok(text.includes("Oat milk"));
  dom.window.close();
});

test("missing graphic shows a placeholder naming the exact drop-in path", async () => {
  const dom = await bootPage();
  const { document, FruitCow } = dom.window;

  const host = document.createElement("div");
  document.body.appendChild(host);

  // No stand-in configured, so a broken image must become a placeholder slot
  // that tells the owner exactly where to put their file.
  const img = FruitCow.imageWithFallback("assets/img/fruit-cow-logo.png", "logo", "logo");
  host.appendChild(img);
  img.dispatchEvent(new dom.window.Event("error"));

  const slot = host.querySelector(".fc-slot");
  assert.ok(slot, "placeholder slot should replace the broken image");
  assert.equal(slot.querySelector("code").textContent, "assets/img/fruit-cow-logo.png");
  dom.window.close();
});

test("the original artwork wins, with the vector emblem as stand-in", async () => {
  const dom = await bootPage();
  const { document, FruitCow, SITE_CONTENT } = dom.window;

  // A stand-in means the broken image is swapped, not placeholdered.
  const host = document.createElement("div");
  document.body.appendChild(host);
  const img = FruitCow.imageWithFallback(
    "assets/img/fruit-cow-logo.jpg", "logo", "logo", "assets/img/logo-emblem.svg"
  );
  host.appendChild(img);
  img.dispatchEvent(new dom.window.Event("error"));
  assert.ok(img.isConnected, "the image survives when a stand-in is configured");
  assert.ok(img.getAttribute("src").endsWith("assets/img/logo-emblem.svg"),
    "falls back to the emblem, got " + img.getAttribute("src"));
  assert.ok(!host.querySelector(".fc-slot"), "no placeholder while the stand-in holds");

  // And if the stand-in is missing too, it must still degrade to a placeholder
  // rather than loop on the error handler.
  img.dispatchEvent(new dom.window.Event("error"));
  assert.ok(host.querySelector(".fc-slot"), "a broken stand-in still shows a placeholder");

  // The brand points at the original file; the stand-in must actually ship.
  const b = SITE_CONTENT.business;
  assert.equal(b.logo, "assets/img/fruit-cow-logo.jpg", "the original artwork is the brand mark");
  assert.ok(
    fs.existsSync(path.join(ROOT, b.logoFallback)),
    "the stand-in emblem must ship so the brand is never broken"
  );
  assert.equal(SITE_CONTENT.hero.image, b.logo, "the cover slot shows the same original artwork");
  assert.ok(
    fs.existsSync(path.join(ROOT, SITE_CONTENT.hero.imageFallback)),
    "the cover slot has a stand-in too"
  );
  dom.window.close();
});

test("locations render hours for every day declared in content.js", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;
  const loc = c.locations[0];
  const block = document.querySelector(".fc-loc");
  assert.equal(block.querySelector(".fc-loc__name").textContent, loc.name);
  assert.equal(block.querySelectorAll(".fc-hours__row").length, Object.keys(loc.hours).length);
  assert.ok(block.textContent.includes("11:00 AM – 9:00 PM"));
  dom.window.close();
});

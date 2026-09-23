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

test("sizeOptions handles single prices, and per-size prices if ever added", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCow } = dom.window;
  const sizes = c.customizations.sizes || [];

  // The board prices one cup per item, so every shipped item is single-price.
  const single = c.menu.find((m) => m.name === "Signature Organic Kale & Rice Yogurt Smoothie");
  assert.deepEqual(own(FruitCow.sizeOptions(single, sizes)), [
    { id: null, label: null, detail: null, price: 9.99 }
  ]);
  assert.equal(FruitCow.fromPrice(single, sizes), 9.99);

  c.menu.forEach((item) => {
    assert.equal(own(FruitCow.sizeOptions(item, sizes)).length, 1,
      item.name + " should show exactly one price");
  });

  // Per-size pricing still works, for the day the shop sells sizes again.
  const sized = { prices: { S: 5, L: 7 } };
  const tiers = [{ id: "S", label: "Small" }, { id: "M", label: "Medium" }, { id: "L", label: "Large" }];
  assert.deepEqual(own(FruitCow.sizeOptions(sized, tiers)).map((o) => o.id), ["S", "L"],
    "a size the item does not price is skipped, not shown blank");

  assert.deepEqual(own(FruitCow.sizeOptions({})), []);
  dom.window.close();
});

test("filterMenu and groupByCategory drive the category chips", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCow } = dom.window;

  assert.equal(FruitCow.filterMenu(c.menu, {}).length, c.menu.length);
  assert.equal(
    FruitCow.filterMenu(c.menu, { category: "burrito" }).length,
    c.menu.filter((m) => m.category === "burrito").length
  );
  // Search reads the name and the series, so "kale" also catches the kale series.
  assert.equal(FruitCow.filterMenu(c.menu, { query: "avocado" }).length, 2);
  assert.equal(FruitCow.filterMenu(c.menu, { category: "fruit", query: "kale" }).length, 1);
  assert.equal(FruitCow.filterMenu(c.menu, { query: "zzzznotathing" }).length, 0);

  const groups = FruitCow.groupByCategory(c.menu, c.categories);
  assert.deepEqual(
    groups.map((g) => g.category.id),
    c.categories.map((c2) => c2.id),
    "groups keep the order declared in categories[]"
  );
  // featured items sort to the front of their group
  const fruit = groups.find((g) => g.category.id === "fruit");
  assert.equal(fruit.items[0].name, "Signature Organic Kale & Rice Yogurt Smoothie");
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

test("every card shows the one price printed on the board", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const money = (n) => "$" + n.toFixed(2);

  c.menu.forEach((item) => {
    const card = [...document.querySelectorAll(".fc-card")].find((el) =>
      el.querySelector(".fc-card__name").textContent.includes(item.name)
    );
    assert.ok(card, "no card for " + item.name);
    assert.equal(card.querySelectorAll(".fc-prices__row").length, 0, item.name + " has no size rows");
    assert.equal(
      card.querySelector(".fc-prices__value").textContent,
      money(item.price),
      item.name + " should print " + money(item.price)
    );
  });

  // Spot-check the extremes of the board.
  const cheapest = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Classic Original Rice Burrito")
  );
  assert.equal(cheapest.querySelector(".fc-prices__value").textContent, "$12.00");
  dom.window.close();
});

test("search box filters the rendered cards live", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const search = document.getElementById("fc-search");
  const visible = () => [...document.querySelectorAll(".fc-card")].filter((x) => !x.hidden).length;

  assert.equal(visible(), c.menu.length);

  search.value = "avocado";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(visible(), 2);
  assert.equal(document.getElementById("fc-empty").hidden, true);

  // 12 burritos, matched by name and by their series.
  search.value = "burrito";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(visible(), c.menu.filter((m) => m.category === "burrito").length);

  search.value = "zzzznotathing";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(visible(), 0);
  assert.equal(document.getElementById("fc-empty").hidden, false);

  search.value = "";
  search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(visible(), c.menu.length);
  dom.window.close();
});

test("category chip narrows the menu and hides empty groups", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const chip = [...document.querySelectorAll(".fc-chip")].find((b) => b.dataset.cat === "burrito");
  chip.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

  const visibleGroups = [...document.querySelectorAll(".fc-group")].filter((g) => !g.hidden);
  assert.equal(visibleGroups.length, 1);
  assert.equal(visibleGroups[0].id, "cat-burrito");
  assert.equal(
    visibleGroups[0].querySelectorAll(".fc-card:not([hidden])").length,
    c.menu.filter((m) => m.category === "burrito").length
  );

  const all = [...document.querySelectorAll(".fc-chip")].find((b) => b.dataset.cat === "all");
  all.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  assert.equal([...document.querySelectorAll(".fc-card")].filter((x) => !x.hidden).length, c.menu.length);
  dom.window.close();
});

test("the build-your-drink band shows only the choices the menu stocks", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const band = document.getElementById("customize");
  const titles = [...band.querySelectorAll(".fc-optgroup__title")].map((h) => h.textContent);
  assert.deepEqual(titles, ["Sweetness", "Ice", "Glutinous Rice & Toppings"], "sweetness, ice and rice toppings");

  // Every level listed comes straight from content.js.
  const text = band.textContent;
  c.customizations.sweetness.forEach((s2) => assert.ok(text.includes(s2.label)));
  c.customizations.ice.forEach((i) => assert.ok(text.includes(i.label)));
  c.customizations.toppings.forEach((t) => assert.ok(text.includes(t.label), "topping shown: " + t.label));
  // Rice toppings carry a price; sweetness and ice remain free.
  const priced = band.querySelectorAll(".fc-opt__price");
  assert.ok(priced.length >= c.customizations.toppings.length, "toppings show their add-on price");
  assert.ok(text.includes("White Glutinous Rice"), "rice emphasis");
  assert.ok(text.includes("Mochi"), "mochi on offer");
  assert.ok(text.includes("Popping Boba"), "popping boba on offer");
  assert.ok(!text.includes("Oat milk"), "milks still not on the menu");
  dom.window.close();
});

test("adding a choice list back in content.js brings its panel back", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  // Toppings already exist — adding milks is the reverse proof that the
  // generic machinery works for any group.
  c.customizations.milks = [{ id: "oat", label: "Oat milk", addPrice: 0.75 }];
  c.categories.find((cat) => cat.id === "fruit").options = ["sweetness", "ice", "toppings", "milk"];
  FruitCow.boot();

  const titles = [...document.querySelectorAll(".fc-optgroup__title")].map((h) => h.textContent);
  assert.deepEqual(titles, ["Sweetness", "Ice", "Glutinous Rice & Toppings", "Milk"]);
  assert.ok(document.getElementById("customize").textContent.includes("+$0.75"));
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
  // Every location declared in content.js gets a card, with its own hours grid.
  const blocks = document.querySelectorAll(".fc-loc");
  assert.equal(blocks.length, c.locations.length, "one card per location");
  c.locations.forEach((loc, idx) => {
    const block = blocks[idx];
    assert.equal(block.querySelector(".fc-loc__name").textContent, loc.name);
    assert.equal(block.querySelectorAll(".fc-hours__row").length, Object.keys(loc.hours).length);
    assert.ok(block.textContent.includes(loc.address.slice(0, 12)));
  });
  // Business-level address and hours are echoed in the footer.
  assert.ok(c.business.address, "business has an address");
  assert.ok(c.business.hours, "business has hours");
  const footer = document.querySelector(".fc-footer").textContent;
  assert.ok(footer.includes(c.business.address.slice(0, 10)));
  assert.ok(footer.includes("10:00 AM"));
  dom.window.close();
});

/* ------------------------------------------------------- the board itself */

/**
 * The menu exactly as printed on the Fruit Cow board: five series, 28 items,
 * one price each. This is the transcription — if a name or price here ever
 * disagrees with content.js, one of the two is wrong.
 */
const BOARD = {
  fruit: [
    ["Signature Organic Kale & Rice Yogurt Smoothie", 9.99],
    ["Signature Honey Peach & Rice Yogurt", 11.99],
    ["Peach Apricot Gardenia & Rice Yogurt Smoothie", 12.99],
    ["Special Peach & Rice Yogurt Smoothie", 12.99],
    ["Avocado and Honeydew Melon & Rice Smoothie", 11.99],
    ["Avocado and Almond & Rice Yogurt Smoothie", 11.99]
  ],
  yogurt: [
    ["Peach Yogurt Ice Cheese", 13.99],
    ["Kale Yogurt Ice Cheese", 13.99]
  ],
  kale: [
    ["Kale & Cucumber White Glutinous Rice Yogurt Smoothie", 10.99],
    ["Kale & Chia Seed, Cucumber & White Glutinous Rice Yogurt Smoothie", 10.99],
    ["Kale & Rice Vine White Glutinous Rice Yogurt Smoothie", 10.99],
    ["Countryside White Glutinous Rice Yogurt Smoothie", 10.99]
  ],
  nut: [
    ["Pistachio White Glutinous Rice Yogurt Smoothie", 11.99],
    ["Walnut White Glutinous Rice Yogurt Smoothie", 11.99],
    ["Snow Mountain Pine Nut White Glutinous Rice Yogurt Smoothie", 11.99],
    ["Sea Salt Hazelnut White Glutinous Rice Yogurt Smoothie", 11.99]
  ],
  burrito: [
    ["Salted Egg Yolk Rice Burrito", 16],
    ["Lava Cheese Ham Rice Burrito", 17],
    ["Boneless Chicken Cutlet Rice Burrito", 18],
    ["Spicy Pepper Chicken Tender Rice Burrito", 16],
    ["Crab Stick & Ham Rice Burrito", 14],
    ["Corn & Cheese Rice Burrito", 15],
    ["Classic Ham Rice Burrito", 15],
    ["Classic Original Rice Burrito", 12],
    ["Orleans Chicken Cutlet Rice Burrito", 15],
    ["Teriyaki Sauce Stir-Fried Sausage Rice Burrito", 18],
    ["Korean Kimchi Rice Burrito", 13],
    ["Japanese Chashu Rice Burrito", 16]
  ]
};

test("content.js matches the printed board, item for item and price for price", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c } = dom.window;

  assert.deepEqual(
    own(c.categories.map((cat) => cat.id)),
    Object.keys(BOARD),
    "the five series, in board order"
  );

  Object.entries(BOARD).forEach(([catId, items]) => {
    const shipped = c.menu.filter((m) => m.category === catId);
    assert.deepEqual(
      own(shipped.map((m) => [m.name, m.price])),
      items,
      catId + " series does not match the board"
    );
  });

  const total = Object.values(BOARD).reduce((n, items) => n + items.length, 0);
  assert.equal(c.menu.length, total, "the menu holds the board and nothing else");
  dom.window.close();
});

test("the old sample drinks are gone for good", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const retired = [
    "Strawberry Cow", "Mango Cow Swirl", "Lychee Rose Milk Tea",
    "Classic Black Milk Tea", "Brown Sugar Boba Milk", "Jasmine Green Milk Tea",
    "Taro Milk Tea", "Matcha Milk Tea", "Passion Fruit Green Tea",
    "Grapefruit Oolong", "Peach Blossom Tea", "Strawberry Banana Smoothie",
    "Mango Slush", "Mochi Bites (3 pc)", "Egg Waffle"
  ];
  const names = c.menu.map((m) => m.name);
  const page = document.getElementById("fc-app").textContent;

  retired.forEach((name) => {
    assert.ok(!names.includes(name), name + " is still in content.js");
    assert.ok(!page.includes(name), name + " is still rendered on the page");
  });

  const retiredCategories = ["signature", "milktea", "fruittea", "frozen", "snack"];
  retiredCategories.forEach((id) => {
    assert.ok(!c.categories.some((cat) => cat.id === id), "sample category " + id + " is still here");
    assert.equal(document.getElementById("cat-" + id), null, "sample section " + id + " still renders");
  });
  dom.window.close();
});

test("a card with no description renders no empty paragraph", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  // The board carries no blurbs, so no card should ship a hollow <p>.
  assert.ok(c.menu.every((m) => !m.description), "the board has no descriptions");
  assert.equal(document.querySelectorAll(".fc-card__desc").length, 0);

  // Add one back and it appears, on that card only.
  c.menu[0].description = "Organic kale blended with white glutinous rice yogurt.";
  FruitCow.boot();
  const descs = [...document.querySelectorAll(".fc-card__desc")];
  assert.equal(descs.length, 1);
  assert.equal(descs[0].textContent, c.menu[0].description);
  dom.window.close();
});

test("every item prices as one cup, and every series reaches the nav", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  c.menu.forEach((item) => {
    assert.equal(typeof item.price, "number", item.name + " needs a plain numeric price");
    assert.ok(item.price > 0, item.name + " needs a real price");
    assert.ok(!item.prices, item.name + " should not carry size tiers the board does not sell");
  });

  // The header links every series, not just the first four.
  const navLinks = [...document.querySelectorAll(".fc-nav__link")].map((a) => a.textContent);
  c.categories.forEach((cat) => {
    assert.ok(navLinks.includes(cat.name), "nav is missing " + cat.name);
  });
  assert.ok(navLinks.includes("Locations"));
  dom.window.close();
});

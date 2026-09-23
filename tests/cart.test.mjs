/* ==========================================================================
   FRUIT COW — ORDERING TESTS
   Run with:  npm test
   Boots the REAL page and drives the REAL cart: customizer, pricing,
   quantity, validation and the order slip.

   The menu is the real board: one price per item, free sweetness and ice on
   the drinks, nothing at all on the burritos.
   ========================================================================== */

import test from "node:test";
import assert from "node:assert/strict";
import { bootPage, own, click } from "./helpers.mjs";

/* A drink and a burrito, by the ids app.js slugs from their names. */
const SMOOTHIE = "signature-organic-kale-rice-yogurt-smoothie";  // $9.99
const BURRITO = "classic-original-rice-burrito";                  // $12

/* ------------------------------------------------------------ pricing math */

test("a drink prices from its single `price`; sweetness and ice stay free, rice toppings add their price", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const plain = Cart.createLine({ itemId: SMOOTHIE }, c);
  assert.equal(plain.unitPrice, 9.99);

  // Every sweetness and ice combination costs exactly the same.
  const fussy = Cart.createLine(
    { itemId: SMOOTHIE, sweetnessId: "s100", iceId: "extra" },
    c
  );
  assert.equal(fussy.unitPrice, 9.99, "sweetness and ice are free");

  // Glutinous-rice toppings are priced — one and two together.
  const withRice = Cart.createLine({ itemId: SMOOTHIE, toppingIds: ["extra-rice"] }, c);
  assert.equal(withRice.unitPrice, 10.99);
  assert.deepEqual(own(withRice.toppingIds), ["extra-rice"]);

  const withTwo = Cart.createLine({ itemId: SMOOTHIE, toppingIds: ["extra-rice", "tapioca"] }, c);
  // 9.99 + 1.00 + 0.75
  assert.equal(withTwo.unitPrice, 11.74);

  // The board sells no sizes or milks, so asking for them changes neither the
  // price nor the line; toppings that exist are kept.
  const impossible = Cart.createLine(
    { itemId: SMOOTHIE, sizeId: "L", milkId: "oat" },
    c
  );
  assert.equal(impossible.unitPrice, 9.99);
  assert.equal(impossible.sizeId, null, "no size tiers on this menu");
  assert.equal(impossible.milkId, null, "no milk swaps on this menu");
  dom.window.close();
});

test("every board price survives the trip into a cart line", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  c.menu.forEach((item) => {
    const line = Cart.createLine({ itemId: item.id }, c);
    assert.equal(line.unitPrice, item.price, item.name + " should price at " + item.price);
    assert.equal(line.lineTotal, item.price);
  });
  dom.window.close();
});

test("a burrito takes no drink choices at all", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const burrito = Cart.createLine({ itemId: BURRITO, sweetnessId: "s100", iceId: "none", qty: 3 }, c);
  assert.equal(burrito.unitPrice, 12);
  assert.equal(burrito.sizeId, null, "food has no size");
  assert.equal(burrito.sweetnessId, null, "food takes no sweetness");
  assert.equal(burrito.iceId, null, "food takes no ice");
  assert.equal(burrito.lineTotal, 36);
  dom.window.close();
});

test("createLine fills sensible defaults and clamps quantity", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const line = Cart.createLine({ itemId: SMOOTHIE }, c);
  assert.equal(line.sizeId, null, "the board sells one cup, so there is no size to default to");
  assert.equal(line.sweetnessId, "s50");
  assert.equal(line.iceId, "reg");
  assert.deepEqual(own(line.toppingIds), []);
  assert.equal(line.qty, 1);

  assert.equal(Cart.createLine({ itemId: SMOOTHIE, qty: 0 }, c).qty, 1);
  assert.equal(Cart.createLine({ itemId: SMOOTHIE, qty: -4 }, c).qty, 1);
  assert.equal(Cart.createLine({ itemId: SMOOTHIE, qty: "3" }, c).qty, 3);
  dom.window.close();
});

test("subtotal and count add up across lines", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const lines = [
    Cart.createLine({ itemId: SMOOTHIE, qty: 2 }, c),
    Cart.createLine({ itemId: BURRITO, qty: 1 }, c)
  ];
  // 2 x 9.99 + 12
  assert.equal(Cart.cartSubtotal(lines), 31.98);
  assert.equal(Cart.cartCount(lines), 3);
  assert.equal(Cart.cartSubtotal([]), 0);
  dom.window.close();
});

test("describeLine names the choices a customer picked", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const line = Cart.createLine(
    { itemId: SMOOTHIE, sweetnessId: "s25", iceId: "light" },
    c
  );
  assert.equal(Cart.describeLine(line, c), "25% sweet \u00b7 Light ice");

  const withTopping = Cart.createLine(
    { itemId: SMOOTHIE, sweetnessId: "s25", iceId: "light", toppingIds: ["extra-rice", "tapioca"] },
    c
  );
  assert.equal(Cart.describeLine(withTopping, c), "25% sweet \u00b7 Light ice \u00b7 +White Glutinous Rice \u00b7 +Tapioca Pearls");

  const plain = Cart.createLine({ itemId: BURRITO }, c);
  assert.equal(Cart.describeLine(plain, c), "", "a burrito has nothing to describe");
  dom.window.close();
});

test("option groups follow the series, and only ones the menu really has", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  // Drinks: sweetness, ice and the glutinous-rice toppings.
  ["fruit", "yogurt", "kale", "nut"].forEach((catId) => {
    const drink = c.menu.find((m) => m.category === catId);
    assert.deepEqual(own(Cart.optionsFor(drink, c)), ["sweetness", "ice", "toppings"],
      catId + " should offer sweetness, ice and toppings");
  });

  const burrito = c.menu.find((m) => m.category === "burrito");
  assert.deepEqual(own(Cart.optionsFor(burrito, c)), [], "burritos take no options");

  // An item can still override its series.
  const quiet = Object.assign({}, c.menu[0], { options: ["ice"] });
  assert.deepEqual(own(Cart.optionsFor(quiet, c)), ["ice"]);

  // And a group the menu does not stock is dropped even when asked for.
  const greedy = Object.assign({}, c.menu[0], { options: ["size", "toppings", "milk", "ice"] });
  assert.deepEqual(own(Cart.optionsFor(greedy, c)), ["toppings", "ice"],
    "groups with no entries in customizations are not offered");
  dom.window.close();
});

/* ---------------------------------------------------------------- checkout */

test("validateOrder blocks an empty cart and missing contact details", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  assert.deepEqual(own(Cart.validateOrder({ lines: [] }, c)), [
    "Your cart is empty.",
    "We need a name for the order.",
    "We need a phone number or email."
  ]);

  const line = Cart.createLine({ itemId: BURRITO }, c);
  assert.deepEqual(own(Cart.validateOrder({ name: "  ", contact: "x@y.z", lines: [line] }, c)), [
    "We need a name for the order."
  ]);
  assert.deepEqual(own(Cart.validateOrder({ name: "Ada", contact: "555 0100", lines: [line] }, c)), []);
  dom.window.close();
});

test("endpoint mode without an endpoint is reported, not silently dropped", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const broken = JSON.parse(JSON.stringify(c));
  broken.ordering.mode = "endpoint";
  broken.ordering.endpoint = "";
  const line = Cart.createLine({ itemId: BURRITO }, broken);

  const problems = own(Cart.validateOrder({ name: "Ada", contact: "555", lines: [line] }, broken));
  assert.equal(problems.length, 1);
  assert.ok(problems[0].includes('ordering.endpoint is empty'));
  dom.window.close();
});

test("the order slip lists every choice and the total", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const order = {
    name: "Ada",
    contact: "555 0100",
    pickupTime: "15:30",
    lines: [
      Cart.createLine({ itemId: SMOOTHIE, sweetnessId: "s25", iceId: "light", notes: "no straw" }, c),
      Cart.createLine({ itemId: BURRITO, qty: 2 }, c)
    ]
  };
  const slip = Cart.buildOrderSlip(order, c);

  assert.ok(slip.includes("Fruit Cow \u2014 ORDER"));
  assert.ok(slip.includes("Name:    Ada"));
  assert.ok(slip.includes("Pickup:  15:30"));
  assert.ok(slip.includes("1 x Signature Organic Kale & Rice Yogurt Smoothie  $9.99"));
  assert.ok(slip.includes("25% sweet \u00b7 Light ice"));
  assert.ok(slip.includes("note: no straw"));
  assert.ok(slip.includes("2 x Classic Original Rice Burrito  $24.00"));
  assert.ok(slip.includes("TOTAL: $33.99"));
  dom.window.close();
});

/* ------------------------------------------------------------- rendered UI */

test("every orderable item gets an Add button; sold-out items do not", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const orderable = c.menu.filter((m) => !m.soldOut);
  assert.equal(document.querySelectorAll(".fc-add").length, orderable.length);
  assert.ok(document.getElementById("fc-cart-toggle"), "header shows the order button");
  dom.window.close();
});

test("turning ordering off in content.js removes the whole flow", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCow } = dom.window;

  c.ordering.enabled = false;
  FruitCow.boot();

  assert.equal(document.querySelectorAll(".fc-add").length, 0);
  assert.equal(document.getElementById("fc-cart-toggle"), null);
  assert.equal(document.getElementById("fc-cart"), null);
  dom.window.close();
});

/** Find a rendered card by the name printed on it. */
function cardNamed(document, name) {
  return [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes(name)
  );
}

test("clicking Add opens the customizer with only the choices the board offers", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  const card = cardNamed(document, "Signature Organic Kale & Rice Yogurt Smoothie");
  click(dom, card.querySelector(".fc-add"));

  const modal = document.getElementById("fc-customizer");
  assert.ok(modal, "customizer should open");
  assert.equal(
    modal.querySelector(".fc-modal__title").textContent,
    "Signature Organic Kale & Rice Yogurt Smoothie"
  );
  assert.ok(modal.querySelector('input[name="fc-opt-sweetness"]'), "sweetness offered");
  assert.ok(modal.querySelector('input[name="fc-opt-ice"]'), "ice offered");
  assert.ok(modal.querySelector('input[name="fc-opt-toppings"]'), "glutinous-rice toppings offered");
  assert.equal(modal.querySelector('input[name="fc-opt-size"]'), null, "no sizes on this menu");
  assert.equal(modal.querySelector('input[name="fc-opt-milk"]'), null, "no milk swaps on this menu");
  // Toppings are listed with their prices; sweetness/ice are not.
  assert.ok(modal.textContent.includes("White Glutinous Rice"));
  assert.ok(modal.textContent.includes("+$1.00"));

  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$9.99");

  // Sweetness and ice are free, so the price only moves when toppings or quantity change.
  const full = modal.querySelector('input[name="fc-opt-sweetness"][value="s100"]');
  full.checked = true;
  full.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$9.99");

  const topping = modal.querySelector('input[name="fc-opt-toppings"][value="extra-rice"]');
  topping.checked = true;
  topping.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$10.99");

  topping.checked = false;
  topping.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$9.99");

  click(dom, modal.querySelector('[data-act="inc"]'));
  assert.equal(modal.querySelector("#fc-customizer-qty").textContent, "2");
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$19.98");
  dom.window.close();
});

test("a burrito opens straight to quantity and notes", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  click(dom, cardNamed(document, "Classic Original Rice Burrito").querySelector(".fc-add"));
  const modal = document.getElementById("fc-customizer");
  assert.equal(modal.querySelectorAll(".fc-choices").length, 0, "no choice groups for food");
  assert.ok(modal.querySelector('textarea[name="fc-notes"]'), "notes are still offered");
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$12.00");
  dom.window.close();
});

test("adding to the cart shows the line, the badge and the subtotal", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  click(dom, cardNamed(document, "Peach Yogurt Ice Cheese").querySelector(".fc-add"));
  click(dom, document.getElementById("fc-customizer-add"));

  assert.equal(document.getElementById("fc-customizer"), null, "customizer closed");
  assert.equal(document.getElementById("fc-cart").hidden, false, "cart drawer opened");
  assert.equal(document.getElementById("fc-cart-count").textContent, "1");
  assert.equal(document.getElementById("fc-cart-count").hidden, false);
  assert.equal(document.getElementById("fc-cart-subtotal").textContent, "$13.99");

  const line = document.querySelector(".fc-line");
  assert.ok(line.textContent.includes("1 \u00d7 Peach Yogurt Ice Cheese"));
  assert.ok(line.textContent.includes("50% sweet \u00b7 Regular"));
  dom.window.close();
});

test("quantity buttons and remove work in the cart", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  click(dom, cardNamed(document, "Classic Original Rice Burrito").querySelector(".fc-add"));
  click(dom, document.getElementById("fc-customizer-add"));
  assert.equal(document.getElementById("fc-cart-subtotal").textContent, "$12.00");

  click(dom, document.querySelector('[data-act="inc"]'));
  assert.equal(document.getElementById("fc-cart-subtotal").textContent, "$24.00");
  assert.equal(document.getElementById("fc-cart-count").textContent, "2");

  click(dom, document.querySelector('[data-act="dec"]'));
  click(dom, document.querySelector('[data-act="dec"]'));
  assert.equal(document.querySelectorAll(".fc-line").length, 0, "dropping to zero removes the line");
  assert.ok(document.querySelector(".fc-cart__empty"), "empty state shown");
  assert.equal(document.getElementById("fc-cart-count").hidden, true, "badge hides at zero");
  dom.window.close();
});

test("checkout refuses a blank form, then confirms and shows the slip", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  click(dom, cardNamed(document, "Classic Original Rice Burrito").querySelector(".fc-add"));
  click(dom, document.getElementById("fc-customizer-add"));

  const form = document.getElementById("fc-checkout");
  const submit = () => form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

  submit();
  const errors = document.getElementById("fc-order-errors");
  assert.equal(errors.hidden, false, "errors shown");
  assert.equal(errors.querySelectorAll("li").length, 2);

  form.elements["fc-name"].value = "Ada";
  form.elements["fc-contact"].value = "555 0100";
  submit();

  const done = document.getElementById("fc-done");
  assert.ok(done, "confirmation shown");
  assert.ok(done.textContent.includes("Thanks! Your order is in"));
  const slip = done.querySelector(".fc-slip");
  assert.ok(slip.value.includes("1 x Classic Original Rice Burrito  $12.00"));
  assert.ok(slip.value.includes("TOTAL: $12.00"));
  assert.equal(document.querySelectorAll(".fc-line").length, 0, "cart cleared after ordering");
  dom.window.close();
});

test("a saved cart is re-priced from content.js, never trusted at its old total", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  // Simulate a cart saved before a price change: stale unit and line totals,
  // and options (size, toppings) the board no longer sells.
  Cart.__setStorage({
    read: () => [{
      itemId: SMOOTHIE,
      sizeId: "M",
      sweetnessId: "s50",
      iceId: "reg",
      toppingIds: ["boba"],
      milkId: "oat",
      qty: 2,
      unitPrice: 99.99,
      lineTotal: 199.98
    }],
    write: () => {},
    clear: () => {}
  });
  Cart.mount(c);

  // 2 x 9.99 = 19.98, not the 199.98 that was stored and not a penny of
  // add-ons the menu no longer offers.
  assert.equal(document.getElementById("fc-cart-subtotal").textContent, "$19.98");
  assert.equal(document.getElementById("fc-cart-count").textContent, "2");
  dom.window.close();
});

test("an item deleted from content.js drops out of a saved cart", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  Cart.__setStorage({
    read: () => [{ itemId: "no-longer-on-the-menu", sizeId: "M", qty: 1 }],
    write: () => {},
    clear: () => {}
  });
  Cart.mount(c);

  assert.equal(document.querySelectorAll(".fc-line").length, 0);
  assert.ok(document.querySelector(".fc-cart__empty"));
  dom.window.close();
});

/* ==========================================================================
   FRUIT COW — ORDERING TESTS
   Run with:  npm test
   Boots the REAL page and drives the REAL cart: customizer, pricing,
   quantity, validation and the order slip.
   ========================================================================== */

import test from "node:test";
import assert from "node:assert/strict";
import { bootPage, own, click } from "./helpers.mjs";

/* ------------------------------------------------------------ pricing math */

test("drink price is size + toppings + milk; sweetness and ice are free", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const line = Cart.createLine(
    { itemId: "classic-black-milk-tea", sizeId: "M", toppingIds: ["boba"], milkId: "oat" },
    c
  );
  // 5.25 base + 0.75 boba + 0.75 oat milk
  assert.equal(line.unitPrice, 6.75);

  const noExtras = Cart.createLine({ itemId: "classic-black-milk-tea", sizeId: "M" }, c);
  assert.equal(noExtras.unitPrice, 5.25);

  // Sweetness and ice must not move the price.
  const withChoices = Cart.createLine(
    { itemId: "classic-black-milk-tea", sizeId: "M", sweetnessId: "s100", iceId: "extra" },
    c
  );
  assert.equal(withChoices.unitPrice, 5.25);

  // Two toppings stack.
  const twoToppings = Cart.createLine(
    { itemId: "classic-black-milk-tea", sizeId: "S", toppingIds: ["boba", "pudding"] },
    c
  );
  assert.equal(twoToppings.unitPrice, 4.5 + 0.75 + 1.0);
  dom.window.close();
});

test("a food item prices from its single `price`, ignoring size", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const waffle = Cart.createLine({ itemId: "egg-waffle", sizeId: "L", qty: 3 }, c);
  assert.equal(waffle.unitPrice, 5.5);
  assert.equal(waffle.sizeId, null, "food has no size");
  assert.equal(waffle.lineTotal, 16.5);
  dom.window.close();
});

test("createLine fills sensible defaults and clamps quantity", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const line = Cart.createLine({ itemId: "classic-black-milk-tea" }, c);
  assert.equal(line.sizeId, "S", "defaults to the smallest size the item actually prices");
  assert.equal(line.sweetnessId, "s50");
  assert.equal(line.iceId, "reg");
  assert.deepEqual(own(line.toppingIds), []);
  assert.equal(line.qty, 1);

  assert.equal(Cart.createLine({ itemId: "classic-black-milk-tea", qty: 0 }, c).qty, 1);
  assert.equal(Cart.createLine({ itemId: "classic-black-milk-tea", qty: -4 }, c).qty, 1);
  assert.equal(Cart.createLine({ itemId: "classic-black-milk-tea", qty: "3" }, c).qty, 3);
  dom.window.close();
});

test("an item that omits a size cannot be ordered at that size", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  // Mango Slush only prices M and L.
  assert.equal(Cart.createLine({ itemId: "mango-slush" }, c).sizeId, "M");
  assert.equal(Cart.createLine({ itemId: "mango-slush", sizeId: "L" }, c).unitPrice, 7.0);
  dom.window.close();
});

test("subtotal and count add up across lines", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const lines = [
    Cart.createLine({ itemId: "classic-black-milk-tea", sizeId: "M", qty: 2 }, c),
    Cart.createLine({ itemId: "egg-waffle", qty: 1 }, c)
  ];
  assert.equal(Cart.cartSubtotal(lines), 16.0);
  assert.equal(Cart.cartCount(lines), 3);
  assert.equal(Cart.cartSubtotal([]), 0);
  dom.window.close();
});

test("describeLine names the choices a customer picked", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const line = Cart.createLine(
    { itemId: "classic-black-milk-tea", sizeId: "L", sweetnessId: "s25", iceId: "light", toppingIds: ["aloe"], milkId: "oat" },
    c
  );
  assert.equal(Cart.describeLine(line, c), "Large · 25% sweet · Light ice · Oat milk · +Aloe vera");

  const plain = Cart.createLine({ itemId: "egg-waffle" }, c);
  assert.equal(Cart.describeLine(plain, c), "");
  dom.window.close();
});

test("optionsFor gives drinks the full choice set and food none", async () => {
  const dom = await bootPage();
  const { SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  const drink = c.menu.find((m) => m.name === "Classic Black Milk Tea");
  assert.deepEqual(own(Cart.optionsFor(drink, c)), ["size", "sweetness", "ice", "toppings", "milk"]);

  const food = c.menu.find((m) => m.name === "Egg Waffle");
  assert.deepEqual(own(Cart.optionsFor(food, c)), []);
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

  const line = Cart.createLine({ itemId: "egg-waffle" }, c);
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
  const line = Cart.createLine({ itemId: "egg-waffle" }, broken);

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
      Cart.createLine({ itemId: "classic-black-milk-tea", sizeId: "M", sweetnessId: "s25", toppingIds: ["boba"], notes: "no straw" }, c),
      Cart.createLine({ itemId: "egg-waffle", qty: 2 }, c)
    ]
  };
  const slip = Cart.buildOrderSlip(order, c);

  assert.ok(slip.includes("Fruit Cow — ORDER"));
  assert.ok(slip.includes("Name:    Ada"));
  assert.ok(slip.includes("Pickup:  15:30"));
  assert.ok(slip.includes("1 x Classic Black Milk Tea  $6.00"));
  assert.ok(slip.includes("Medium · 25% sweet · Regular · +Tapioca boba"));
  assert.ok(slip.includes("note: no straw"));
  assert.ok(slip.includes("2 x Egg Waffle  $11.00"));
  assert.ok(slip.includes("TOTAL: $17.00"));
  dom.window.close();
});

/* ------------------------------------------------------------- rendered UI */

test("every orderable item gets an Add button; sold-out items do not", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c } = dom.window;

  const orderable = c.menu.filter((m) => !m.soldOut);
  assert.equal(document.querySelectorAll(".fc-add").length, orderable.length);

  const soldOutCard = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Peach Blossom Tea")
  );
  assert.equal(soldOutCard.querySelector(".fc-add"), null);
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

test("clicking Add opens the customizer and pricing updates live", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  const card = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Classic Black Milk Tea")
  );
  click(dom, card.querySelector(".fc-add"));

  const modal = document.getElementById("fc-customizer");
  assert.ok(modal, "customizer should open");
  assert.equal(modal.querySelector(".fc-modal__title").textContent, "Classic Black Milk Tea");
  assert.ok(modal.querySelector('input[name="fc-opt-size"]'), "size choices offered");
  assert.ok(modal.querySelector('input[name="fc-opt-toppings"]'), "toppings offered");
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$4.50", "small, no extras");

  // Pick Large.
  const large = modal.querySelector('input[name="fc-opt-size"][value="L"]');
  large.checked = true;
  large.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$6.00");

  // Add boba (+0.75) and sea salt cream (+1.25).
  ["boba", "cream"].forEach((id) => {
    const box = modal.querySelector(`input[name="fc-opt-toppings"][value="${id}"]`);
    box.checked = true;
    box.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  });
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$8.00");

  // Two of them.
  click(dom, modal.querySelector('[data-act="inc"]'));
  assert.equal(modal.querySelector("#fc-customizer-qty").textContent, "2");
  assert.equal(modal.querySelector("#fc-customizer-price").textContent, "$16.00");
  dom.window.close();
});

test("adding to the cart shows the line, the badge and the subtotal", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  const card = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Classic Black Milk Tea")
  );
  click(dom, card.querySelector(".fc-add"));
  click(dom, document.querySelector('input[name="fc-opt-size"][value="M"]'));
  click(dom, document.getElementById("fc-customizer-add"));

  assert.equal(document.getElementById("fc-customizer"), null, "customizer closed");
  assert.equal(document.getElementById("fc-cart").hidden, false, "cart drawer opened");
  assert.equal(document.getElementById("fc-cart-count").textContent, "1");
  assert.equal(document.getElementById("fc-cart-count").hidden, false);
  assert.equal(document.getElementById("fc-cart-subtotal").textContent, "$5.25");

  const line = document.querySelector(".fc-line");
  assert.ok(line.textContent.includes("1 × Classic Black Milk Tea"));
  assert.ok(line.textContent.includes("Medium · 50% sweet · Regular"));
  dom.window.close();
});

test("quantity buttons and remove work in the cart", async () => {
  const dom = await bootPage();
  const { document } = dom.window;

  const card = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Egg Waffle")
  );
  click(dom, card.querySelector(".fc-add"));
  click(dom, document.getElementById("fc-customizer-add"));
  assert.equal(document.getElementById("fc-cart-subtotal").textContent, "$5.50");

  click(dom, document.querySelector('[data-act="inc"]'));
  assert.equal(document.getElementById("fc-cart-subtotal").textContent, "$11.00");
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

  const card = [...document.querySelectorAll(".fc-card")].find((el) =>
    el.querySelector(".fc-card__name").textContent.includes("Egg Waffle")
  );
  click(dom, card.querySelector(".fc-add"));
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
  assert.ok(slip.value.includes("1 x Egg Waffle  $5.50"));
  assert.ok(slip.value.includes("TOTAL: $5.50"));
  assert.equal(document.querySelectorAll(".fc-line").length, 0, "cart cleared after ordering");
  dom.window.close();
});

test("a saved cart is re-priced from content.js, never trusted at its old total", async () => {
  const dom = await bootPage();
  const { document, SITE_CONTENT: c, FruitCowCart: Cart } = dom.window;

  // Simulate a cart saved before a price change: stale unit and line totals.
  Cart.__setStorage({
    read: () => [{
      itemId: "classic-black-milk-tea",
      sizeId: "M",
      sweetnessId: "s50",
      iceId: "reg",
      toppingIds: ["boba"],
      milkId: null,
      qty: 2,
      unitPrice: 99.99,
      lineTotal: 199.98
    }],
    write: () => {},
    clear: () => {}
  });
  Cart.mount(c);

  // 2 × (5.25 + 0.75 boba) = 12.00, not the 199.98 that was stored.
  assert.equal(document.getElementById("fc-cart-subtotal").textContent, "$12.00");
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

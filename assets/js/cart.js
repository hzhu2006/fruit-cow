/* ==========================================================================
   FRUIT COW  —  CART & ORDERING
   Pure pricing/validation logic at the top (unit-tested), DOM below.
   Driven entirely by the `ordering` block in assets/js/content.js.
   ========================================================================== */
(function (global) {
  "use strict";

  var STORAGE_KEY = "fruit-cow:cart:v1";

  /* ------------------------------------------------------------------ pure */

  function orderingConfig(content) {
    var o = (content && content.ordering) || {};
    return {
      enabled: o.enabled !== false && !!content && !!(content.ordering),
      mode: o.mode === "endpoint" ? "endpoint" : "slip",
      endpoint: o.endpoint || "",
      prepTime: o.prepTime || "",
      confirmationMessage: o.confirmationMessage || "Thanks — order received.",
      notesPlaceholder: o.notesPlaceholder || "Anything else?",
      paymentMethods: o.paymentMethods || [],
      minOrder: typeof o.minOrder === "number" ? o.minOrder : 0
    };
  }

  /** Which option groups apply to an item. `item.options` overrides the default. */
  function optionsFor(item, content) {
    if (!item) return [];
    if (item.options && Array.isArray(item.options)) return item.options.slice();
    // Per-size pricing means it's a made-to-order drink; single price means food.
    var isDrink = !!(item.prices && typeof item.prices === "object");
    return isDrink ? ["size", "sweetness", "ice", "toppings", "milk"] : [];
  }

  function findById(list, id) {
    if (!id) return null;
    return (list || []).filter(function (o) { return o.id === id; })[0] || null;
  }

  function toppingByIds(content, ids) {
    return (ids || [])
      .map(function (id) { return findById(content.customizations.toppings, id); })
      .filter(Boolean);
  }

  /**
   * Unit price for one configured drink:
   * size price + every topping add-on + milk add-on. Sweetness and ice are free.
   */
  function lineUnitPrice(line, content) {
    var item = findById(content.menu, line.itemId);
    if (!item) return 0;

    var base = 0;
    if (item.prices && typeof item.prices === "object") {
      base = typeof item.prices[line.sizeId] === "number" ? item.prices[line.sizeId] : 0;
    } else if (typeof item.price === "number") {
      base = item.price;
    }

    var extras = toppingByIds(content, line.toppingIds).reduce(function (sum, t) {
      return sum + (typeof t.addPrice === "number" ? t.addPrice : 0);
    }, 0);

    var milk = findById(content.customizations.milks, line.milkId);
    if (milk && typeof milk.addPrice === "number") extras += milk.addPrice;

    return Math.round((base + extras) * 100) / 100;
  }

  /** Build a normalised cart line from a draft, computing its unit price. */
  function createLine(draft, content) {
    var item = findById(content.menu, draft.itemId);
    var sizes = (content.customizations && content.customizations.sizes) || [];
    var applicable = optionsFor(item, content);

    var sizeId = null;
    if (applicable.indexOf("size") !== -1) {
      var sized = sizes.filter(function (s) { return item.prices && typeof item.prices[s.id] === "number"; });
      sizeId = draft.sizeId || (sized[0] && sized[0].id) || null;
    }

    var line = {
      id: draft.id || "ln" + Math.random().toString(36).slice(2, 9),
      itemId: draft.itemId,
      name: item ? item.name : "Unknown item",
      sizeId: sizeId,
      sweetnessId: applicable.indexOf("sweetness") !== -1 ? (draft.sweetnessId || "s50") : null,
      iceId: applicable.indexOf("ice") !== -1 ? (draft.iceId || "reg") : null,
      toppingIds: applicable.indexOf("toppings") !== -1 ? (draft.toppingIds || []).slice() : [],
      milkId: applicable.indexOf("milk") !== -1 ? (draft.milkId || null) : null,
      qty: Math.max(1, parseInt(draft.qty, 10) || 1),
      notes: draft.notes || ""
    };
    line.unitPrice = lineUnitPrice(line, content);
    line.lineTotal = Math.round(line.unitPrice * line.qty * 100) / 100;
    return line;
  }

  function cartSubtotal(lines) {
    return Math.round((lines || []).reduce(function (sum, l) { return sum + (l.lineTotal || 0); }, 0) * 100) / 100;
  }

  function cartCount(lines) {
    return (lines || []).reduce(function (sum, l) { return sum + (l.qty || 0); }, 0);
  }

  /** Human-readable option string, e.g. "Medium · 50% · Light ice · +Aloe vera". */
  function describeLine(line, content) {
    var c = content.customizations || {};
    var parts = [];
    var size = findById(c.sizes, line.sizeId);
    if (size) parts.push(size.label);
    var sweet = findById(c.sweetness, line.sweetnessId);
    if (sweet) parts.push(sweet.label + " sweet");
    var ice = findById(c.ice, line.iceId);
    if (ice) parts.push(ice.label);
    var milk = findById(c.milks, line.milkId);
    if (milk) parts.push(milk.label);
    toppingByIds(content, line.toppingIds).forEach(function (t) { parts.push("+" + t.label); });
    return parts.join(" · ");
  }

  /** Checkout validation. Returns plain-English problem strings. */
  function validateOrder(order, content) {
    var cfg = orderingConfig(content);
    var problems = [];
    var lines = (order && order.lines) || [];

    if (!lines.length) problems.push("Your cart is empty.");
    if (!order || !String(order.name || "").trim()) problems.push("We need a name for the order.");
    if (!order || !String(order.contact || "").trim()) problems.push("We need a phone number or email.");

    if (cfg.mode === "endpoint" && !cfg.endpoint) {
      problems.push("ordering.mode is \"endpoint\" but ordering.endpoint is empty — set it in content.js.");
    }
    if (cfg.minOrder > 0 && cartSubtotal(lines) < cfg.minOrder) {
      problems.push("Minimum order is " + cfg.minOrder + ".");
    }
    return problems;
  }

  /** Plain-text order slip — what the customer copies, texts or emails. */
  function buildOrderSlip(order, content) {
    var cfg = orderingConfig(content);
    var money = content.business.currency || "$";
    var out = [];
    out.push(content.business.name + " — ORDER");
    out.push("=================================");
    out.push("Name:    " + order.name);
    out.push("Contact: " + order.contact);
    if (order.pickupTime) out.push("Pickup:  " + order.pickupTime);
    out.push("");
    (order.lines || []).forEach(function (l) {
      out.push(l.qty + " x " + l.name + "  " + money + l.lineTotal.toFixed(2));
      var desc = describeLine(l, content);
      if (desc) out.push("     " + desc);
      if (l.notes) out.push("     note: " + l.notes);
    });
    out.push("");
    out.push("TOTAL: " + money + cartSubtotal(order.lines).toFixed(2));
    if (order.payment) out.push("Pay:   " + order.payment);
    if (cfg.prepTime) out.push("Ready in about " + cfg.prepTime);
    return out.join("\n");
  }

  /* --------------------------------------------------------------- storage */

  /** localStorage throws on opaque origins (e.g. file://) — never let it break. */
  var storage = {
    read: function () {
      try {
        var raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) { return []; }
    },
    write: function (lines) {
      try { global.localStorage && global.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); }
      catch (e) { /* storage unavailable — cart stays in memory only */ }
    },
    clear: function () {
      try { global.localStorage && global.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
  };

  /* -------------------------------------------------------------------- dom */

  function el(tag, attrs, children) {
    return global.FruitCow.el(tag, attrs, children);
  }

  var state = { lines: [], content: null, lastFocus: null };

  function persist() { storage.write(state.lines); }

  function render() {
    var content = state.content;
    var badge = document.getElementById("fc-cart-count");
    if (badge) {
      var n = cartCount(state.lines);
      badge.textContent = n;
      badge.hidden = n === 0;
    }
    var list = document.getElementById("fc-cart-lines");
    if (!list) return;

    list.replaceChildren();
    if (!state.lines.length) {
      list.appendChild(el("p", { class: "fc-cart__empty", text: "Nothing in your cup yet." }));
    }

    state.lines.forEach(function (line) {
      var row = el("li", { class: "fc-line" }, [
        el("div", { class: "fc-line__body" }, [
          el("p", { class: "fc-line__name", text: line.qty + " × " + line.name }),
          el("p", { class: "fc-line__desc", text: describeLine(line, content) }),
          line.notes ? el("p", { class: "fc-line__note", text: "“" + line.notes + "”" }) : null
        ]),
        el("div", { class: "fc-line__side" }, [
          el("span", { class: "fc-line__price", text: content.business.currency + line.lineTotal.toFixed(2) }),
          el("div", { class: "fc-qty" }, [
            el("button", { class: "fc-qty__btn", type: "button", "data-act": "dec", "data-id": line.id, "aria-label": "One fewer " + line.name, text: "−" }),
            el("span", { class: "fc-qty__n", text: String(line.qty) }),
            el("button", { class: "fc-qty__btn", type: "button", "data-act": "inc", "data-id": line.id, "aria-label": "One more " + line.name, text: "+" })
          ]),
          el("button", { class: "fc-line__remove", type: "button", "data-act": "remove", "data-id": line.id, text: "Remove" })
        ])
      ]);
      list.appendChild(row);
    });

    var sub = document.getElementById("fc-cart-subtotal");
    if (sub) {
      sub.textContent = content.business.currency + cartSubtotal(state.lines).toFixed(2);
    }
  }

  function openCart() {
    var drawer = document.getElementById("fc-cart");
    if (!drawer) return;
    state.lastFocus = document.activeElement;
    render();
    drawer.hidden = false;
    drawer.classList.add("is-open");
    document.body.classList.add("fc-locked");
    var first = drawer.querySelector("input, button");
    if (first) first.focus();
  }

  function closeCart() {
    var drawer = document.getElementById("fc-cart");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.hidden = true;
    document.body.classList.remove("fc-locked");
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  function addToCart(line) {
    state.lines.push(line);
    persist();
    render();
    openCart();
  }

  function setQty(id, delta) {
    state.lines = state.lines.map(function (l) {
      if (l.id !== id) return l;
      var qty = l.qty + delta;
      if (qty < 1) return null;
      l.qty = qty;
      l.lineTotal = Math.round(l.unitPrice * qty * 100) / 100;
      return l;
    }).filter(Boolean);
    persist();
    render();
  }

  function removeLine(id) {
    state.lines = state.lines.filter(function (l) { return l.id !== id; });
    persist();
    render();
  }

  /* --------------------------------------------------------- customizer */

  function choiceGroup(label, name, options, selectedId, currency) {
    return el("fieldset", { class: "fc-field", "data-group": name }, [
      el("legend", { class: "fc-field__label", text: label }),
      el("div", { class: "fc-choices" }, options.map(function (o) {
        var isSel = o.id === selectedId;
        return el("label", { class: "fc-choice" + (isSel ? " is-on" : "") }, [
          el("input", {
            type: "radio", name: "fc-opt-" + name, value: o.id,
            checked: isSel ? "checked" : null
          }),
          el("span", { class: "fc-choice__text" }, [
            document.createTextNode(o.label),
            o.detail ? el("span", { class: "fc-choice__detail", text: o.detail }) : null,
            typeof o.addPrice === "number"
              ? el("span", { class: "fc-choice__add", text: "+" + currency + o.addPrice.toFixed(2) })
              : null
          ])
        ]);
      }))
    ]);
  }

  function checkGroup(label, name, options, currency) {
    return el("fieldset", { class: "fc-field", "data-group": name }, [
      el("legend", { class: "fc-field__label", text: label }),
      el("div", { class: "fc-choices" }, options.map(function (o) {
        return el("label", { class: "fc-choice" }, [
          el("input", { type: "checkbox", name: "fc-opt-" + name, value: o.id }),
          el("span", { class: "fc-choice__text" }, [
            document.createTextNode(o.label),
            typeof o.addPrice === "number"
              ? el("span", { class: "fc-choice__add", text: "+" + currency + o.addPrice.toFixed(2) })
              : null
          ])
        ]);
      }))
    ]);
  }

  /** Modal for configuring one drink before it goes in the cart. */
  function openCustomizer(item) {
    var content = state.content;
    var cur = content.business.currency;
    var applicable = optionsFor(item, content);
    var c = content.customizations;

    var sized = (c.sizes || []).filter(function (s) {
      return item.prices && typeof item.prices[s.id] === "number";
    }).map(function (s) {
      return { id: s.id, label: s.label, detail: cur + item.prices[s.id].toFixed(2) };
    });

    var body = el("div", { class: "fc-customizer__body" });
    if (applicable.indexOf("size") !== -1 && sized.length) {
      body.appendChild(choiceGroup("Size", "size", sized, sized[0].id, cur));
    }
    if (applicable.indexOf("sweetness") !== -1) {
      body.appendChild(choiceGroup("Sweetness", "sweetness", c.sweetness, "s50", cur));
    }
    if (applicable.indexOf("ice") !== -1) {
      body.appendChild(choiceGroup("Ice", "ice", c.ice, "reg", cur));
    }
    if (applicable.indexOf("milk") !== -1 && (c.milks || []).length) {
      body.appendChild(choiceGroup("Milk", "milk", [{ id: "", label: "As served" }].concat(c.milks), "", cur));
    }
    if (applicable.indexOf("toppings") !== -1 && (c.toppings || []).length) {
      body.appendChild(checkGroup("Toppings", "toppings", c.toppings, cur));
    }

    body.appendChild(el("label", { class: "fc-field fc-field--stack" }, [
      el("span", { class: "fc-field__label", text: "Notes" }),
      el("textarea", { class: "fc-input", name: "fc-notes", rows: "2", placeholder: content.ordering.notesPlaceholder })
    ]));

    var priceOut = el("span", { class: "fc-customizer__price", id: "fc-customizer-price" });

    var dialog = el("div", {
      class: "fc-modal", id: "fc-customizer", role: "dialog", "aria-modal": "true",
      "aria-label": "Customise " + item.name
    }, [
      el("div", { class: "fc-modal__backdrop", "data-act": "close" }),
      el("div", { class: "fc-modal__panel" }, [
        el("header", { class: "fc-modal__head" }, [
          el("h2", { class: "fc-modal__title", text: item.name }),
          el("button", { class: "fc-modal__x", type: "button", "data-act": "close", "aria-label": "Close", text: "×" })
        ]),
        body,
        el("footer", { class: "fc-modal__foot" }, [
          el("div", { class: "fc-qty" }, [
            el("button", { class: "fc-qty__btn", type: "button", "data-act": "dec", "aria-label": "One fewer", text: "−" }),
            el("span", { class: "fc-qty__n", id: "fc-customizer-qty", text: "1" }),
            el("button", { class: "fc-qty__btn", type: "button", "data-act": "inc", "aria-label": "One more", text: "+" })
          ]),
          priceOut,
          el("button", { class: "fc-btn fc-btn--primary", type: "button", id: "fc-customizer-add", text: "Add to order" })
        ])
      ])
    ]);

    document.body.appendChild(dialog);
    state.lastFocus = document.activeElement;
    document.body.classList.add("fc-locked");

    var qty = 1;
    var qtyOut = dialog.querySelector("#fc-customizer-qty");

    function currentDraft() {
      function radio(group) {
        var input = dialog.querySelector('input[name="fc-opt-' + group + '"]:checked');
        return input ? input.value : null;
      }
      var toppings = Array.prototype.map.call(
        dialog.querySelectorAll('input[name="fc-opt-toppings"]:checked'),
        function (i) { return i.value; }
      );
      return {
        itemId: item.id,
        sizeId: radio("size"),
        sweetnessId: radio("sweetness"),
        iceId: radio("ice"),
        milkId: radio("milk") || null,
        toppingIds: toppings,
        qty: qty,
        notes: dialog.querySelector('textarea[name="fc-notes"]').value
      };
    }

    function refreshPrice() {
      var draft = currentDraft();
      qtyOut.textContent = String(qty);
      var line = createLine(draft, content);
      priceOut.textContent = cur + (line.unitPrice * qty).toFixed(2);
    }

    dialog.addEventListener("change", function (event) {
      if (event.target.type === "radio") {
        var field = event.target.closest(".fc-field");
        Array.prototype.forEach.call(field.querySelectorAll(".fc-choice"), function (choice) {
          var input = choice.querySelector("input");
          choice.classList.toggle("is-on", input.checked);
        });
      }
      refreshPrice();
    });

    dialog.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-act]");
      if (!trigger) return;
      var act = trigger.getAttribute("data-act");
      if (act === "close") return closeCustomizer();
      if (act === "inc") { qty += 1; refreshPrice(); }
      if (act === "dec") { qty = Math.max(1, qty - 1); refreshPrice(); }
    });

    dialog.addEventListener("input", function (event) {
      if (event.target.name === "fc-notes") refreshPrice();
    });

    dialog.querySelector("#fc-customizer-add").addEventListener("click", function () {
      addToCart(createLine(currentDraft(), content));
      closeCustomizer();
    });

    document.addEventListener("keydown", onEsc);
    refreshPrice();
    dialog.querySelector(".fc-modal__x").focus();
  }

  function onEsc(event) {
    if (event.key !== "Escape") return;
    var dialog = document.getElementById("fc-customizer");
    if (dialog) return closeCustomizer();
    var drawer = document.getElementById("fc-cart");
    if (drawer && !drawer.hidden) closeCart();
  }

  function closeCustomizer() {
    var dialog = document.getElementById("fc-customizer");
    if (dialog) dialog.remove();
    document.removeEventListener("keydown", onEsc);
    if (!document.getElementById("fc-cart") || document.getElementById("fc-cart").hidden) {
      document.body.classList.remove("fc-locked");
    }
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
  }

  /* ------------------------------------------------------------- checkout */

  function confirmOrder(order) {
    var cfg = orderingConfig(state.content);
    var list = document.getElementById("fc-cart-lines");
    var form = document.getElementById("fc-checkout");
    if (form) form.hidden = true;

    var panel = el("div", { class: "fc-done", id: "fc-done" });
    panel.appendChild(el("p", { class: "fc-done__msg", text: cfg.confirmationMessage }));

    if (cfg.mode === "endpoint") {
      panel.appendChild(el("p", { class: "fc-done__sub", text: "Sent to the store. Reference " + order.reference }));
    } else {
      panel.appendChild(el("p", { class: "fc-done__sub", text: "Send this slip to the store, or show it at the counter." }));
      var slip = el("textarea", { class: "fc-slip", rows: "12", readonly: "readonly" });
      slip.value = order.slip;
      panel.appendChild(slip);
      panel.appendChild(el("div", { class: "fc-done__actions" }, [
        el("button", { class: "fc-btn fc-btn--ghost", type: "button", "data-act": "copy", text: "Copy order" }),
        el("a", {
          class: "fc-btn fc-btn--ghost",
          href: "mailto:" + state.content.business.email +
            "?subject=" + encodeURIComponent(state.content.business.name + " order — " + order.name) +
            "&body=" + encodeURIComponent(order.slip),
          text: "Email it"
        })
      ]));
      panel.addEventListener("click", function (event) {
        if (event.target.getAttribute && event.target.getAttribute("data-act") === "copy") {
          slip.select();
          try { document.execCommand("copy"); } catch (e) {}
          if (global.navigator && global.navigator.clipboard) {
            global.navigator.clipboard.writeText(order.slip).catch(function () {});
          }
          event.target.textContent = "Copied";
        }
      });
    }

    list.replaceChildren(panel);
    var sub = document.getElementById("fc-cart-subtotal");
    if (sub) sub.textContent = "";
    state.lines = [];
    persist();
  }

  function submitOrder(event) {
    event.preventDefault();
    var content = state.content;
    var cfg = orderingConfig(content);
    var form = document.getElementById("fc-checkout");

    var order = {
      name: form.elements["fc-name"].value,
      contact: form.elements["fc-contact"].value,
      pickupTime: form.elements["fc-pickup"].value,
      payment: form.elements["fc-payment"] ? form.elements["fc-payment"].value : "",
      lines: state.lines,
      subtotal: cartSubtotal(state.lines),
      reference: "FC-" + Date.now().toString(36).toUpperCase(),
      placedAt: new Date().toISOString()
    };
    order.slip = buildOrderSlip(order, content);

    var problems = validateOrder(order, content);
    var errorBox = document.getElementById("fc-order-errors");
    errorBox.replaceChildren();
    if (problems.length) {
      problems.forEach(function (p) { errorBox.appendChild(el("li", { text: p })); });
      errorBox.hidden = false;
      return;
    }
    errorBox.hidden = true;

    if (cfg.mode === "endpoint") {
      global.fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          confirmOrder(order);
        })
        .catch(function (err) {
          errorBox.replaceChildren(el("li", { text: "Could not send your order (" + err.message + "). Please call the store." }));
          errorBox.hidden = false;
        });
      return;
    }
    confirmOrder(order);
  }

  /* ---------------------------------------------------------------- mount */

  function mount(content) {
    state.content = content;
    state.lines = storage.read().map(function (raw) {
      // Re-price from content.js so a price change never leaves a stale total.
      return createLine(raw, content);
    }).filter(function (line) { return findById(content.menu, line.itemId); });

    var toggle = document.getElementById("fc-cart-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var drawer = document.getElementById("fc-cart");
        if (drawer && !drawer.hidden) closeCart(); else openCart();
      });
    }

    var drawer = document.getElementById("fc-cart");
    if (!drawer) return;

    drawer.querySelector('[data-act="close-cart"]').addEventListener("click", closeCart);
    drawer.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-act][data-id]");
      if (!trigger) return;
      var id = trigger.getAttribute("data-id");
      var act = trigger.getAttribute("data-act");
      if (act === "inc") setQty(id, +1);
      if (act === "dec") setQty(id, -1);
      if (act === "remove") removeLine(id);
    });
    drawer.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeCart();
    });

    var cfg = orderingConfig(content);
    var form = document.getElementById("fc-checkout");
    if (form) {
      form.addEventListener("submit", submitOrder);
      var paymentSelect = form.elements["fc-payment"];
      if (paymentSelect) {
        paymentSelect.replaceChildren(
          el("option", { value: "", text: "Choose…" })
        );
        cfg.paymentMethods.forEach(function (m) {
          paymentSelect.appendChild(el("option", { value: m, text: m }));
        });
      }
      var notesInput = form.elements["fc-notes"];
      if (notesInput) notesInput.placeholder = cfg.notesPlaceholder;
    }

    document.addEventListener("keydown", onEsc);
    render();
  }

  global.FruitCowCart = {
    orderingConfig: orderingConfig,
    optionsFor: optionsFor,
    lineUnitPrice: lineUnitPrice,
    createLine: createLine,
    cartSubtotal: cartSubtotal,
    cartCount: cartCount,
    describeLine: describeLine,
    validateOrder: validateOrder,
    buildOrderSlip: buildOrderSlip,
    mount: mount,
    openCustomizer: openCustomizer,
    openCart: openCart,
    closeCart: closeCart,
    __setStorage: function (impl) { storage = impl; }
  };
})(typeof globalThis !== "undefined" ? globalThis : this);

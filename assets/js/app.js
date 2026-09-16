/* ==========================================================================
   FRUIT COW  —  RENDERING
   Reads SITE_CONTENT (assets/js/content.js) and builds the page.
   You should not need to edit this file to change your menu.
   ========================================================================== */
(function (global) {
  "use strict";

  /* ------------------------------------------------------------------ pure */

  /** Format a number as currency. Returns "" for anything not a finite number. */
  function formatPrice(value, currency) {
    if (typeof value !== "number" || !isFinite(value)) return "";
    return (currency || "$") + value.toFixed(2);
  }

  /**
   * Resolve the price options for a menu item.
   * `prices` (per size) wins; a single `price` is shown with no size label.
   * Sizes the item doesn't price are skipped rather than shown blank.
   */
  function sizeOptions(item, sizes) {
    if (!item) return [];
    if (item.prices && typeof item.prices === "object") {
      return (sizes || [])
        .filter(function (s) { return typeof item.prices[s.id] === "number"; })
        .map(function (s) {
          return { id: s.id, label: s.label, detail: s.detail, price: item.prices[s.id] };
        });
    }
    if (typeof item.price === "number") {
      return [{ id: null, label: null, detail: null, price: item.price }];
    }
    return [];
  }

  /** Lowest price for an item — used for the "from $x.xx" price display. */
  function fromPrice(item, sizes) {
    var opts = sizeOptions(item, sizes);
    if (!opts.length) return null;
    return opts.reduce(function (min, o) { return o.price < min ? o.price : min; }, opts[0].price);
  }

  /** Search + category filter. Category "all" and empty query match everything. */
  function filterMenu(items, options) {
    var opts = options || {};
    var category = opts.category || "all";
    var query = (opts.query || "").trim().toLowerCase();
    return (items || []).filter(function (item) {
      if (category !== "all" && item.category !== category) return false;
      if (!query) return true;
      var haystack = [item.name, item.description, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }

  /** Group items into their categories, keeping the order given in `categories`. */
  function groupByCategory(items, categories) {
    return (categories || []).map(function (cat) {
      var members = filterMenu(items, { category: cat.id });
      members.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
      return { category: cat, items: members };
    }).filter(function (group) { return group.items.length > 0; });
  }

  /** Stable id for a menu item — the slug of its name unless one is given. */
  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function orderingEnabled(content) {
    return !!(content && content.ordering && content.ordering.enabled !== false);
  }

  /** Assigns `id` to every menu item so the cart can reference it. */
  function normalizeMenu(content) {
    var seen = {};
    (content.menu || []).forEach(function (item) {
      if (!item.id) item.id = slugify(item.name);
      if (seen[item.id]) item.id = item.id + "-" + Object.keys(seen).length;
      seen[item.id] = true;
    });
    return content;
  }

  /**
   * Validate SITE_CONTENT and return human-readable problem strings.
   * Runs on load so a bad edit is caught in the console instead of
   * silently rendering an empty page.
   */
  function validateContent(content) {
    var problems = [];
    if (!content || typeof content !== "object") return ["SITE_CONTENT is missing — check assets/js/content.js"];

    var sizes = (content.customizations && content.customizations.sizes) || [];
    var sizeIds = sizes.map(function (s) { return s.id; });
    var categoryIds = (content.categories || []).map(function (c) { return c.id; });

    if (!content.business || !content.business.name) problems.push("business.name is empty");
    if (!categoryIds.length) problems.push("categories is empty — nothing will render");
    if (!(content.menu || []).length) problems.push("menu is empty — nothing will render");

    (content.menu || []).forEach(function (item, i) {
      var where = "menu[" + i + "] (" + (item.name || "unnamed") + ")";
      if (!item.name) problems.push(where + ": missing name");
      if (categoryIds.indexOf(item.category) === -1) {
        problems.push(where + ": category \"" + item.category + "\" is not in categories[]");
      }
      if (item.prices) {
        Object.keys(item.prices).forEach(function (key) {
          if (sizeIds.indexOf(key) === -1) {
            problems.push(where + ": prices." + key + " is not a size id (have: " + sizeIds.join(", ") + ")");
          }
          if (typeof item.prices[key] !== "number") {
            problems.push(where + ": prices." + key + " must be a number, got " + JSON.stringify(item.prices[key]));
          }
        });
      } else if ("price" in item) {
        if (typeof item.price !== "number") {
          problems.push(where + ": `price` must be a number with no quotes or $, got " + JSON.stringify(item.price));
        }
      } else {
        problems.push(where + ": needs either `prices` per size or a numeric `price`");
      }
    });

    var names = (content.menu || []).map(function (m) { return m.name; }).filter(Boolean);
    names.forEach(function (name, i) {
      if (names.indexOf(name) !== i) {
        problems.push("menu: \"" + name + "\" appears more than once — give one of them a distinct name");
      }
    });

    return problems;
  }

  /* -------------------------------------------------------------------- dom */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "text") node.textContent = attrs[key];
      else if (key === "html") node.innerHTML = attrs[key];
      else if (key.slice(0, 2) === "on") node.addEventListener(key.slice(2), attrs[key]);
      else if (attrs[key] !== null && attrs[key] !== undefined) node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  /**
   * Image with a placeholder fallback. When the file is missing the slot shows
   * a dashed placeholder naming the exact path to drop the graphic into.
   */
  function imageWithFallback(src, alt, variant) {
    var img = el("img", { src: src, alt: alt || "", class: "fc-img fc-img--" + (variant || "default") });
    img.addEventListener("error", function () {
      var box = el("div", { class: "fc-slot fc-slot--" + (variant || "default") }, [
        el("img", { src: "assets/img/placeholder.svg", alt: "", class: "fc-slot__art", "aria-hidden": "true" }),
        el("p", { class: "fc-slot__path" }, [document.createElement("code")]),
      ]);
      box.querySelector("code").textContent = src;
      img.replaceWith(box);
    });
    return img;
  }

  function tagChip(tag) {
    return el("span", { class: "fc-tag fc-tag--" + tag, text: tag.replace(/-/g, " ") });
  }

  function renderHeader(content) {
    var b = content.business;
    var nav = el("nav", { class: "fc-nav", "aria-label": "Sections" },
      (content.categories || []).slice(0, 4).map(function (c) {
        return el("a", { class: "fc-nav__link", href: "#cat-" + c.id, text: c.name });
      }).concat([el("a", { class: "fc-nav__link", href: "#locations", text: "Locations" })])
    );

    return el("header", { class: "fc-header" }, [
      el("div", { class: "fc-shell fc-header__inner" }, [
        el("a", { class: "fc-brand", href: "#top" }, [
          imageWithFallback(b.logo, b.logoAlt, "logo"),
          el("span", { class: "fc-brand__text" }, [
            el("span", { class: "fc-brand__name", text: b.name }),
            el("span", { class: "fc-brand__tagline", text: b.tagline })
          ])
        ]),
        el("div", { class: "fc-header__right" }, [
          nav,
          orderingEnabled(content)
            ? el("button", {
                class: "fc-cartbtn", type: "button", id: "fc-cart-toggle",
                "aria-label": "Open your order"
              }, [
                el("span", { class: "fc-cartbtn__cup", "aria-hidden": "true", text: "🧋" }),
                el("span", { class: "fc-cartbtn__label", text: "Order" }),
                el("span", { class: "fc-cartbtn__count", id: "fc-cart-count", hidden: "hidden", text: "0" })
              ])
            : null
        ])
      ])
    ]);
  }

  function renderHero(content) {
    var h = content.hero;
    var actions = el("div", { class: "fc-hero__actions" });
    if (h.primaryCta) {
      actions.appendChild(el("a", { class: "fc-btn fc-btn--primary", href: h.primaryCta.target, text: h.primaryCta.label }));
    }
    if (h.secondaryCta) {
      actions.appendChild(el("a", { class: "fc-btn fc-btn--ghost", href: h.secondaryCta.target, text: h.secondaryCta.label }));
    }
    return el("section", { class: "fc-hero", id: "top" }, [
      el("div", { class: "fc-shell fc-hero__inner" }, [
        el("div", { class: "fc-hero__copy" }, [
          h.eyebrow ? el("p", { class: "fc-hero__eyebrow", text: h.eyebrow }) : null,
          el("h1", { class: "fc-hero__heading", text: h.heading }),
          el("p", { class: "fc-hero__sub", text: h.subheading }),
          actions
        ]),
        el("div", { class: "fc-hero__media" }, [imageWithFallback(h.image, content.business.name + " banner", "hero")])
      ])
    ]);
  }

  function renderMenuItem(item, content) {
    var sizes = content.customizations.sizes;
    var options = sizeOptions(item, sizes);
    var base = fromPrice(item, sizes);

    var priceNode;
    if (options.length > 1) {
      priceNode = el("ul", { class: "fc-prices" }, options.map(function (o) {
        return el("li", { class: "fc-prices__row" }, [
          el("span", { class: "fc-prices__size" }, [
            document.createTextNode(o.label),
            o.detail ? el("span", { class: "fc-prices__detail", text: o.detail }) : null
          ]),
          el("span", { class: "fc-prices__value", text: formatPrice(o.price, content.business.currency) })
        ]);
      }));
    } else {
      priceNode = el("p", { class: "fc-prices fc-prices--single" }, [
        el("span", { class: "fc-prices__value fc-prices__value--lg", text: formatPrice(base, content.business.currency) })
      ]);
    }

    var card = el("article", {
      class: "fc-card" + (item.soldOut ? " fc-card--out" : "") + (item.featured ? " fc-card--featured" : ""),
      "data-category": item.category,
      "data-item-id": item.id || slugify(item.name)
    }, [
      el("div", { class: "fc-card__head" }, [
        el("h3", { class: "fc-card__name" }, [
          document.createTextNode(item.name),
          item.featured ? el("span", { class: "fc-tag fc-tag--star", text: "★ featured" }) : null
        ]),
        item.soldOut ? el("span", { class: "fc-tag fc-tag--out", text: "Sold out" }) : null
      ]),
      el("p", { class: "fc-card__desc", text: item.description }),
      (item.tags || []).length ? el("div", { class: "fc-card__tags" }, item.tags.map(tagChip)) : null,
      priceNode,
      orderingEnabled(content) && !item.soldOut
        ? el("button", {
            class: "fc-add", type: "button", "data-add": item.id || slugify(item.name),
            text: "Add to order"
          })
        : null
    ]);
    // Carry the item itself so filtering and ordering never re-parse the DOM.
    card.__item = item;
    return card;
  }

  function renderMenu(content) {
    var grid = el("div", { class: "fc-menu__groups", id: "fc-groups" },
      groupByCategory(content.menu, content.categories).map(function (group) {
        return el("section", { class: "fc-group", id: "cat-" + group.category.id }, [
          el("div", { class: "fc-group__head" }, [
            el("h2", { class: "fc-group__title", text: group.category.name }),
            group.category.blurb ? el("p", { class: "fc-group__blurb", text: group.category.blurb }) : null
          ]),
          el("div", { class: "fc-grid" }, group.items.map(function (item) { return renderMenuItem(item, content); }))
        ]);
      })
    );

    var empty = el("p", { class: "fc-empty", id: "fc-empty", hidden: "hidden", text: "Nothing matches that search." });

    var filters = el("div", { class: "fc-filters" }, [
      el("div", { class: "fc-filters__cats", id: "fc-cats" },
        [{ id: "all", name: "All" }].concat(content.categories).map(function (c) {
          return el("button", {
            class: "fc-chip" + (c.id === "all" ? " is-active" : ""),
            type: "button",
            "data-cat": c.id,
            text: c.name
          });
        })
      ),
      el("input", {
        class: "fc-search", id: "fc-search", type: "search",
        placeholder: "Search the menu…", "aria-label": "Search the menu"
      })
    ]);

    return el("section", { class: "fc-menu", id: "menu" }, [
      el("div", { class: "fc-shell" }, [
        el("div", { class: "fc-menu__head" }, [
          el("h2", { class: "fc-section-title", text: "Menu" }),
          el("p", { class: "fc-section-sub", text: "Every drink is made to order. Adjust sweetness, ice and toppings at the counter." })
        ]),
        filters, grid, empty
      ])
    ]);
  }

  function renderOptionGroup(title, options, currency, note) {
    return el("div", { class: "fc-optgroup" }, [
      el("h3", { class: "fc-optgroup__title", text: title }),
      note ? el("p", { class: "fc-optgroup__note", text: note }) : null,
      el("ul", { class: "fc-optlist" }, options.map(function (o) {
        return el("li", { class: "fc-opt" }, [
          el("span", { class: "fc-opt__label" }, [
            document.createTextNode(o.label),
            o.detail ? el("span", { class: "fc-opt__detail", text: o.detail }) : null
          ]),
          typeof o.addPrice === "number"
            ? el("span", { class: "fc-opt__price", text: "+" + formatPrice(o.addPrice, currency) })
            : null
        ]);
      }))
    ]);
  }

  function renderCustomizations(content) {
    var c = content.customizations;
    var cur = content.business.currency;
    var groups = [
      renderOptionGroup("Sizes", c.sizes, cur, "Prices shown per drink above"),
      renderOptionGroup("Sweetness", c.sweetness, cur),
      renderOptionGroup("Ice", c.ice, cur),
      renderOptionGroup("Toppings", c.toppings, cur, "Add to any drink"),
      renderOptionGroup("Milk", c.milks, cur, "Dairy-free options available")
    ];
    return el("section", { class: "fc-custom", id: "customize" }, [
      el("div", { class: "fc-shell" }, [
        el("h2", { class: "fc-section-title", text: "Build your drink" }),
        el("p", { class: "fc-section-sub", text: "Five sweetness levels, five ice levels, and toppings by the scoop." }),
        el("div", { class: "fc-custom__grid" }, groups)
      ])
    ]);
  }

  var DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  var DAY_LABEL = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

  function renderLocations(content) {
    return el("section", { class: "fc-locations", id: "locations" }, [
      el("div", { class: "fc-shell" }, [
        el("h2", { class: "fc-section-title", text: "Locations & hours" }),
        el("div", { class: "fc-loc__grid" }, (content.locations || []).map(function (loc) {
          return el("article", { class: "fc-loc" }, [
            el("h3", { class: "fc-loc__name", text: loc.name }),
            el("p", { class: "fc-loc__addr", text: loc.address }),
            loc.phone ? el("p", { class: "fc-loc__phone" }, [
              el("a", { href: "tel:" + loc.phone.replace(/[^\d+]/g, ""), text: loc.phone })
            ]) : null,
            loc.hours ? el("dl", { class: "fc-hours" },
              DAY_ORDER.filter(function (d) { return loc.hours[d]; }).map(function (d) {
                return el("div", { class: "fc-hours__row" }, [
                  el("dt", { text: DAY_LABEL[d] }),
                  el("dd", { text: loc.hours[d] })
                ]);
              })
            ) : null
          ]);
        }))
      ])
    ]);
  }

  function renderFooter(content) {
    var b = content.business;
    return el("footer", { class: "fc-footer" }, [
      el("div", { class: "fc-shell fc-footer__inner" }, [
        el("div", {}, [
          el("p", { class: "fc-footer__brand", text: b.name }),
          el("p", { class: "fc-footer__note", text: content.footer.note })
        ]),
        el("div", { class: "fc-footer__contact" }, [
          b.phone ? el("p", {}, [el("a", { href: "tel:" + b.phone.replace(/[^\d+]/g, ""), text: b.phone })]) : null,
          b.email ? el("p", {}, [el("a", { href: "mailto:" + b.email, text: b.email })]) : null,
          b.instagram ? el("p", { text: b.instagram }) : null
        ]),
        el("p", { class: "fc-footer__copy", text: "© " + new Date().getFullYear() + " " + content.footer.copyright })
      ])
    ]);
  }

  function renderCartDrawer(content) {
    if (!orderingEnabled(content)) return null;
    return el("aside", {
      class: "fc-drawer", id: "fc-cart", hidden: "hidden",
      role: "dialog", "aria-modal": "true", "aria-label": "Your order"
    }, [
      el("div", { class: "fc-drawer__panel" }, [
        el("header", { class: "fc-drawer__head" }, [
          el("h2", { class: "fc-drawer__title", text: "Your order" }),
          el("button", { class: "fc-modal__x", type: "button", "data-act": "close-cart", "aria-label": "Close order", text: "×" })
        ]),
        el("ul", { class: "fc-cart__lines", id: "fc-cart-lines" }),
        el("div", { class: "fc-cart__total" }, [
          el("span", { text: "Subtotal" }),
          el("span", { class: "fc-cart__amount", id: "fc-cart-subtotal", text: content.business.currency + "0.00" })
        ]),
        el("form", { class: "fc-checkout", id: "fc-checkout", novalidate: "novalidate" }, [
          el("ul", { class: "fc-errors", id: "fc-order-errors", hidden: "hidden" }),
          el("label", { class: "fc-field fc-field--stack" }, [
            el("span", { class: "fc-field__label", text: "Name for the order" }),
            el("input", { class: "fc-input", name: "fc-name", type: "text", autocomplete: "name", required: "required" })
          ]),
          el("label", { class: "fc-field fc-field--stack" }, [
            el("span", { class: "fc-field__label", text: "Phone or email" }),
            el("input", { class: "fc-input", name: "fc-contact", type: "text", autocomplete: "tel", required: "required" })
          ]),
          el("label", { class: "fc-field fc-field--stack" }, [
            el("span", { class: "fc-field__label", text: "Pickup time" }),
            el("input", { class: "fc-input", name: "fc-pickup", type: "time" })
          ]),
          el("label", { class: "fc-field fc-field--stack" }, [
            el("span", { class: "fc-field__label", text: "Payment" }),
            el("select", { class: "fc-input", name: "fc-payment" })
          ]),
          el("button", { class: "fc-btn fc-btn--primary fc-checkout__go", type: "submit", text: "Place order" })
        ])
      ])
    ]);
  }

  /* --------------------------------------------------------------- wiring */

  function wireAddButtons(content) {
    var root = document.getElementById("fc-app");
    root.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-add]");
      if (!trigger) return;
      var id = trigger.getAttribute("data-add");
      var item = (content.menu || []).filter(function (m) { return m.id === id; })[0];
      if (item && global.FruitCowCart) global.FruitCowCart.openCustomizer(item);
    });
  }

  function wireFilters(content) {
    var cats = document.getElementById("fc-cats");
    var search = document.getElementById("fc-search");
    var groupsEl = document.getElementById("fc-groups");
    var emptyEl = document.getElementById("fc-empty");

    function apply() {
      var active = cats.querySelector(".is-active");
      var category = active ? active.getAttribute("data-cat") : "all";
      var query = search.value;
      var visible = 0;

      Array.prototype.forEach.call(groupsEl.children, function (group) {
        var groupId = group.id.replace("cat-", "");
        var catOk = category === "all" || category === groupId;
        var shownInGroup = 0;

        Array.prototype.forEach.call(group.querySelectorAll(".fc-card"), function (card) {
          var keep = catOk && filterMenu([card.__item || {}], { query: query }).length > 0;
          card.hidden = !keep;
          if (keep) shownInGroup++;
        });

        group.hidden = shownInGroup === 0;
        visible += shownInGroup;
      });

      emptyEl.hidden = visible !== 0;
    }

    cats.addEventListener("click", function (event) {
      var chip = event.target.closest(".fc-chip");
      if (!chip) return;
      Array.prototype.forEach.call(cats.querySelectorAll(".fc-chip"), function (c) {
        c.classList.toggle("is-active", c === chip);
      });
      apply();
    });

    search.addEventListener("input", apply);
  }

  function boot() {
    var content = global.SITE_CONTENT;
    var root = document.getElementById("fc-app");
    if (!root) return;

    normalizeMenu(content);

    var problems = validateContent(content);
    if (problems.length) {
      problems.forEach(function (p) { console.warn("[fruit-cow content] " + p); });
    }

    document.title = content.business.name + " — " + content.business.tagline;

    var sections = [
      renderHeader(content),
      renderHero(content),
      renderMenu(content),
      renderCustomizations(content),
      renderLocations(content),
      renderFooter(content),
      renderCartDrawer(content)
    ].filter(Boolean);

    root.replaceChildren.apply(root, sections);

    wireFilters(content);
    if (orderingEnabled(content)) {
      wireAddButtons(content);
      if (global.FruitCowCart) global.FruitCowCart.mount(content);
    }
  }

  global.FruitCow = {
    el: el,
    formatPrice: formatPrice,
    sizeOptions: sizeOptions,
    fromPrice: fromPrice,
    filterMenu: filterMenu,
    groupByCategory: groupByCategory,
    validateContent: validateContent,
    slugify: slugify,
    normalizeMenu: normalizeMenu,
    orderingEnabled: orderingEnabled,
    imageWithFallback: imageWithFallback,
    boot: boot
  };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

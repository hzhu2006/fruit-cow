/* ==========================================================================
   FRUIT COW  —  SITE CONTENT
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Everything the website displays — business name, menu items, prices,
   descriptions, hours, locations — comes from this file. Change a value,
   save, refresh the browser. No build step, no command to run.

   RULES (the site will warn you in the browser console if you break one):
     1. Every string goes in quotes:  "Brown Sugar Boba"
     2. Items are separated by commas. Missing commas are the #1 error.
     3. `category` on a menu item must match an `id` in `categories` below.
     4. Prices are plain numbers, no $ and no quotes:  6.5   not  "$6.50"
     5. Size keys (S / M / L) must match the `id`s in `customizations.sizes`.

   Everything under here is SAMPLE DATA. Overwrite it freely.
   ========================================================================== */

globalThis.SITE_CONTENT = {

  /* ---------------------------------------------------------------- business */
  business: {
    name: "Fruit Cow",
    tagline: "Handmade rice yogurt smoothies, naturally sweetened",
    /* The original artwork is the brand mark: drop the file in at this exact
       path and it appears everywhere, no code change. The vector emblem is
       the stand-in that ships in the meantime so the brand is never broken. */
    logo: "assets/img/fruit-cow-logo.jpg",
    logoFallback: "assets/img/logo-emblem.svg",
    logoAlt: "Fruit Cow logo",
    phone: "(408) 555-0148",
    email: "hello@fruitcow-bayarea.com",
    address: "19500 Vallco Pkwy, Cupertino, CA 95014",
    hours: "Open daily · 10:00 AM – 9:30 PM",
    currency: "$",

    /* Social handles. Add or remove entries freely — the header and footer
       render whatever is here.
         handle : what's shown
         url    : where the icon links ("" = no link, just shows the handle)
         icon   : the glyph
         qr     : optional image shown large in the footer. Drop your WeChat
                  QR at that path and it appears; until then a placeholder
                  names the exact file to drop in.                      */
    social: [
      {
        id: "instagram",
        label: "Instagram",
        handle: "@fruitcow.bayarea",
        url: "https://instagram.com/yourhandle",
        icon: "assets/img/icon-instagram.svg"
      },
      {
        id: "wechat",
        label: "WeChat",
        handle: "FruitCowBayArea",
        url: "",
        qr: "assets/img/wechat-qr.png",
        icon: "assets/img/icon-wechat.svg"
      }
    ]
  },

  /* -------------------------------------------------------------------- hero */
  hero: {
    eyebrow: "Blended daily · Sourced responsibly",
    heading: "Fruit, rice and nothing artificial.",
    subheading:
      "White glutinous rice and live yogurt blended with whole fruit, kale and " +
      "nuts, plus rice burritos rolled to order. No artificial syrups, no shortcuts.",
    /* No big logo in the cover — the header carries the brand. The cover
       stays as wood, terraces and ink drawings so the food comes first.
       Set image to a path if you ever want a banner again. */
    image: "",
    imageFallback: "",
    primaryCta: { label: "View the menu", target: "#menu" },
    secondaryCta: { label: "Find a store", target: "#locations" }
  },

  /* ------------------------------------------------------------------ values */
  /* The strip under the hero. Delete the whole `values` block and the
     section disappears. `icon` is any image path you like. */
  values: [
    {
      icon: "assets/img/ink-rice.svg",
      title: "White glutinous rice, cooked in house",
      body: "Rice steamed each morning and folded through live yogurt — the body in every cup comes from the grain, not from powder. Add extra rice, mochi or crystal rice balls at checkout."
    },
    {
      icon: "assets/img/ink-mango.svg",
      title: "Whole fruit, kale and nuts",
      body: "Honey peach, avocado, organic kale and pistachio prepared daily. If it isn't in season, it isn't on the board."
    },
    {
      icon: "assets/img/ink-citrus.svg",
      title: "Sweetness on your terms",
      body: "Five sweetness levels, four ice levels and house-made glutinous-rice toppings — set on any cup, priced next to each topping."
    }
  ],

  /* ------------------------------------------------------------------- decor */
  /* Decorative artwork. Every entry is just a file path — replace the file at
     that path with your own drawing, same filename, and it appears everywhere.
     Set any entry to "" to switch that piece off.
       seal         the cinnabar-orange stamp beside the brand
       heroArt      the large ink drawing in the cover
       heroAccent   the smaller ink drawing, opposite corner
       terraces     the 梯田 terraced fields across the bottom of the cover
       divider      the long double curve between sections
       ricePattern  scattered rice grains, laid faintly over the paper
       ringPattern  wood cross-section (end grain) printed on section backgrounds
       woodring     one large timber slice, used as a motif on the cover
       coverWood    dark wood print behind the cover
       cardWood     wood grain laid beneath each menu card
       optionsWood  wood grain laid beneath each drink-option panel
       stickers     little paper stickers; `area` is one of
                    "cover" | "values" | "menu" | "locations", and `rotate`
                    is degrees. Add as many as you like.                 */
  decor: {
    seal: "assets/img/seal.svg",
    heroArt: "assets/img/ink-rice.svg",
    heroAccent: "assets/img/ink-plum.svg",
    heroFruit: "assets/img/ink-peach.svg",
    terraces: "assets/img/ink-terraces.svg",
    divider: "assets/img/curve-wave.svg",
    ricePattern: "assets/img/pattern-rice.svg",
    ringPattern: "assets/img/pattern-woodring.svg",
    // The logo's meadow: swirling contour grass with upright tufts.
    grassPattern: "assets/img/pattern-grass.svg",
    woodring: "assets/img/ink-woodring.svg",
    coverWood: "assets/img/pattern-wood-dark.svg",
    cardWood: "assets/img/pattern-wood-oak.svg",
    optionsWood: "assets/img/pattern-wood-walnut.svg",
    stickers: [
      { src: "assets/img/sticker-rice.svg",   area: "cover",     rotate: -12 },
      { src: "assets/img/sticker-citrus.svg", area: "cover",     rotate: 14 },
      { src: "assets/img/sticker-lychee.svg", area: "values",    rotate: -8 },
      { src: "assets/img/deco-cow.svg",       area: "values",    rotate: -4 },
      { src: "assets/img/sticker-rice.svg",   area: "menu",      rotate: 10 },
      { src: "assets/img/sticker-citrus.svg", area: "locations", rotate: -14 }
    ]
  },

  /* --------------------------------------------------------------- categories */
  /* `id` is what menu items point at. Reorder these to reorder the menu.
     `options` (optional) sets which choices every item in that series offers.
     A single item can still override it with its own `options`.
     The drink series get sweetness, ice and the glutinous-rice toppings;
     the burritos stay simple — quantity and notes only. */
  categories: [
    { id: "fruit",   name: "Fruit Series",   blurb: "Fruit and rice yogurt smoothies",        options: ["sweetness", "ice", "toppings"], icon: "assets/img/cat-fruit.svg",   photo: "assets/img/menu/fruit.jpg" },
    { id: "yogurt",  name: "Yogurt Series",  blurb: "Yogurt ice cheese",                      options: ["sweetness", "ice", "toppings"], icon: "assets/img/cat-yogurt.svg",  photo: "assets/img/menu/yogurt.jpg" },
    { id: "kale",    name: "Kale Series",    blurb: "Kale with white glutinous rice yogurt",  options: ["sweetness", "ice", "toppings"], icon: "assets/img/cat-kale.svg",    photo: "assets/img/menu/kale.jpg" },
    { id: "nut",     name: "Nut Series",     blurb: "Nuts with white glutinous rice yogurt",  options: ["sweetness", "ice", "toppings"], icon: "assets/img/cat-nut.svg",     photo: "assets/img/menu/nut.jpg" },
    { id: "burrito", name: "Burrito Series", blurb: "Rice burritos",                          options: [],                               icon: "assets/img/cat-burrito.svg", photo: "assets/img/menu/burrito.jpg" }
  ],

  /* -------------------------------------------------------------------- menu */
  /* Transcribed from the Fruit Cow menu board. Every name and price is as
     printed there — one cup, one price, so each item uses `price` rather than
     per-size `prices`.

     Add an item by copying any block below and changing the values.
       price       : a plain number, no $ and no quotes
       prices      : use this INSTEAD of `price` if you ever sell by size
       description : optional — the board carries none, so none are invented
       tags        : optional — "vegan" "gf" "dairy-free" "spicy" "new"
       featured    : optional — true promotes it to the top of its series
       soldOut     : optional — true greys it out and shows "Sold out"       */
  menu: [
    /* ------------------------------------------------------------ fruit */
    { name: "Signature Organic Kale & Rice Yogurt Smoothie", category: "fruit", price: 9.99,  featured: true, image: "assets/img/menu/signature-organic-kale-rice-yogurt-smoothie.jpg" },
    { name: "Signature Honey Peach & Rice Yogurt",           category: "fruit", price: 11.99, featured: true, image: "assets/img/menu/signature-honey-peach-rice-yogurt.jpg" },
    { name: "Peach Apricot Gardenia & Rice Yogurt Smoothie", category: "fruit", price: 12.99, image: "assets/img/menu/peach-apricot-gardenia-rice-yogurt-smoothie.jpg" },
    { name: "Special Peach & Rice Yogurt Smoothie",          category: "fruit", price: 12.99, image: "assets/img/menu/special-peach-rice-yogurt-smoothie.jpg" },
    { name: "Avocado and Honeydew Melon & Rice Smoothie",    category: "fruit", price: 11.99, image: "assets/img/menu/avocado-and-honeydew-melon-rice-smoothie.jpg" },
    { name: "Avocado and Almond & Rice Yogurt Smoothie",     category: "fruit", price: 11.99, image: "assets/img/menu/avocado-and-almond-rice-yogurt-smoothie.jpg" },

    /* ----------------------------------------------------------- yogurt */
    { name: "Peach Yogurt Ice Cheese", category: "yogurt", price: 13.99, image: "assets/img/menu/peach-yogurt-ice-cheese.jpg" },
    { name: "Kale Yogurt Ice Cheese",  category: "yogurt", price: 13.99, image: "assets/img/menu/kale-yogurt-ice-cheese.jpg" },

    /* ------------------------------------------------------------- kale */
    { name: "Kale & Cucumber White Glutinous Rice Yogurt Smoothie",                category: "kale", price: 10.99, image: "assets/img/menu/kale-cucumber-white-glutinous-rice-yogurt-smoothie.jpg" },
    { name: "Kale & Chia Seed, Cucumber & White Glutinous Rice Yogurt Smoothie",   category: "kale", price: 10.99, image: "assets/img/menu/kale-chia-seed-cucumber-white-glutinous-rice-yogurt-smoothie.jpg" },
    { name: "Kale & Rice Vine White Glutinous Rice Yogurt Smoothie",               category: "kale", price: 10.99, image: "assets/img/menu/kale-rice-vine-white-glutinous-rice-yogurt-smoothie.jpg" },
    { name: "Countryside White Glutinous Rice Yogurt Smoothie",                    category: "kale", price: 10.99, image: "assets/img/menu/countryside-white-glutinous-rice-yogurt-smoothie.jpg" },

    /* -------------------------------------------------------------- nut */
    { name: "Pistachio White Glutinous Rice Yogurt Smoothie",              category: "nut", price: 11.99, image: "assets/img/menu/pistachio-white-glutinous-rice-yogurt-smoothie.jpg" },
    { name: "Walnut White Glutinous Rice Yogurt Smoothie",                 category: "nut", price: 11.99, image: "assets/img/menu/walnut-white-glutinous-rice-yogurt-smoothie.jpg" },
    { name: "Snow Mountain Pine Nut White Glutinous Rice Yogurt Smoothie", category: "nut", price: 11.99, image: "assets/img/menu/snow-mountain-pine-nut-white-glutinous-rice-yogurt-smoothie.jpg" },
    { name: "Sea Salt Hazelnut White Glutinous Rice Yogurt Smoothie",      category: "nut", price: 11.99, image: "assets/img/menu/sea-salt-hazelnut-white-glutinous-rice-yogurt-smoothie.jpg" },

    /* ---------------------------------------------------------- burrito */
    { name: "Salted Egg Yolk Rice Burrito",                 category: "burrito", price: 16, image: "assets/img/menu/salted-egg-yolk-rice-burrito.jpg" },
    { name: "Lava Cheese Ham Rice Burrito",                 category: "burrito", price: 17, image: "assets/img/menu/lava-cheese-ham-rice-burrito.jpg" },
    { name: "Boneless Chicken Cutlet Rice Burrito",         category: "burrito", price: 18, image: "assets/img/menu/boneless-chicken-cutlet-rice-burrito.jpg" },
    { name: "Spicy Pepper Chicken Tender Rice Burrito",     category: "burrito", price: 16, image: "assets/img/menu/spicy-pepper-chicken-tender-rice-burrito.jpg" },
    { name: "Crab Stick & Ham Rice Burrito",                category: "burrito", price: 14, image: "assets/img/menu/crab-stick-ham-rice-burrito.jpg" },
    { name: "Corn & Cheese Rice Burrito",                   category: "burrito", price: 15, image: "assets/img/menu/corn-cheese-rice-burrito.jpg" },
    { name: "Classic Ham Rice Burrito",                     category: "burrito", price: 15, image: "assets/img/menu/classic-ham-rice-burrito.jpg" },
    { name: "Classic Original Rice Burrito",                category: "burrito", price: 12, image: "assets/img/menu/classic-original-rice-burrito.jpg" },
    { name: "Orleans Chicken Cutlet Rice Burrito",          category: "burrito", price: 15, image: "assets/img/menu/orleans-chicken-cutlet-rice-burrito.jpg" },
    { name: "Teriyaki Sauce Stir-Fried Sausage Rice Burrito", category: "burrito", price: 18, image: "assets/img/menu/teriyaki-sauce-stir-fried-sausage-rice-burrito.jpg" },
    { name: "Korean Kimchi Rice Burrito",                   category: "burrito", price: 13, image: "assets/img/menu/korean-kimchi-rice-burrito.jpg" },
    { name: "Japanese Chashu Rice Burrito",                 category: "burrito", price: 16, image: "assets/img/menu/japanese-chashu-rice-burrito.jpg" }
  ],

  /* ----------------------------------------------------------- customizations */
  /* These show in the "Build your drink" section and in the customiser.
     Every drink on the board is one cup at one price. Add-ons are where
     the glutinous-rice philosophy becomes tangible — the grain, pounded,
     steamed and rolled, right in the toppings.

     To hide add-ons, delete a list (or empty it). To change what a series
     offers, change its `options` in `categories` above. Empty or missing lists
     simply do not render.                                                   */
  customizations: {
    sweetness: [
      { id: "s0",   label: "0%",   detail: "No sugar" },
      { id: "s25",  label: "25%",  detail: "Light" },
      { id: "s50",  label: "50%",  detail: "Half sweet" },
      { id: "s75",  label: "75%",  detail: "Sweet" },
      { id: "s100", label: "100%", detail: "Full" }
    ],
    ice: [
      { id: "none",  label: "No ice" },
      { id: "light", label: "Light ice" },
      { id: "reg",   label: "Regular" },
      { id: "extra", label: "Extra ice" }
    ],
    toppings: [
      { id: "extra-rice",        label: "White Glutinous Rice",       detail: "house-steamed",   addPrice: 1.00 },
      { id: "rice-mochi",        label: "Handmade Rice Mochi",        detail: "3 pcs · chewy",  addPrice: 1.50 },
      { id: "brown-sugar-mochi", label: "Brown Sugar Rice Mochi",     detail: "3 pcs · torched", addPrice: 1.50 },
      { id: "crystal-balls",     label: "Crystal Glutinous Rice Balls", detail: "QQ · translucent", addPrice: 1.00 },
      { id: "red-bean-rice",     label: "Red Bean & Glutinous Rice",  detail: "slow-cooked adzuki", addPrice: 1.25 },
      { id: "taro-mochi",        label: "Taro Rice Mochi",            detail: "2 pcs · taro + rice", addPrice: 1.50 },
      { id: "mango-popping",     label: "Mango Popping Boba",         addPrice: 1.00 },
      { id: "brown-sugar-boba",  label: "Brown Sugar Popping Boba",   addPrice: 0.75 },
      { id: "strawberry-popping",label: "Strawberry Popping Boba",    addPrice: 1.00 },
      { id: "tapioca",           label: "Tapioca Pearls",             detail: "classic",         addPrice: 0.75 }
    ]
  },

  /* ---------------------------------------------------------------- ordering */
  /* Controls the cart and checkout.
       enabled  : false hides every "Add" button and the cart — menu becomes
                  browse-only again
       mode     : "slip"     → shows a formatted order slip to copy / text / email
                              (no server needed, works the moment you deploy)
                  "endpoint" → POSTs the order as JSON to `endpoint`
       endpoint : where orders are sent when mode is "endpoint" — a Formspree,
                  Google Form, or your own backend URL
     Per item, `options` can override which choices a drink offers, e.g.
       options: ["sweetness", "ice", "toppings"]
     Items priced with `prices` (per size) get the full drink options by
     default; single-`price` items get quantity and notes only.               */
  ordering: {
    enabled: true,
    mode: "slip",
    endpoint: "",
    prepTime: "10–15 minutes",
    confirmationMessage: "Thanks! Your order is in — have it ready at pickup.",
    notesPlaceholder: "Allergies, extra rice, less ice — anything else?",
    paymentMethods: ["Cash at pickup", "Card at pickup"],
    minOrder: 0
  },

  /* ---------------------------------------------------------------- locations */
  /* Two New York outposts. Edit in place — the page, the hours grid and the
     Google-Maps pins all follow what is here. `mapsUrl` is optional; when
     present the address links out. */
  locations: [
    {
      name: "Cupertino · Vallco (Flagship)",
      address: "19500 Vallco Pkwy, Cupertino, CA 95014 — Level 1, Vallco Mall",
      phone: "(408) 555-0148",
      mapsUrl: "https://maps.google.com/?q=19500+Vallco+Pkwy+Cupertino+CA+95014",
      hours: {
        mon: "10:00 AM – 9:30 PM",
        tue: "10:00 AM – 9:30 PM",
        wed: "10:00 AM – 9:30 PM",
        thu: "10:00 AM – 10:00 PM",
        fri: "10:00 AM – 10:00 PM",
        sat: "10:00 AM – 10:00 PM",
        sun: "10:00 AM – 9:00 PM"
      }
    },
    {
      name: "San Francisco · Inner Sunset",
      address: "1240 Irving St, San Francisco, CA 94122 — near Golden Gate Park",
      phone: "(415) 555-0162",
      mapsUrl: "https://maps.google.com/?q=1240+Irving+St+San+Francisco+CA+94122",
      hours: {
        mon: "11:00 AM – 9:00 PM",
        tue: "11:00 AM – 9:00 PM",
        wed: "11:00 AM – 9:00 PM",
        thu: "11:00 AM – 9:00 PM",
        fri: "11:00 AM – 10:00 PM",
        sat: "11:00 AM – 10:00 PM",
        sun: "11:00 AM – 9:00 PM"
      }
    }
  ],

  /* ------------------------------------------------------------------- footer */
  footer: {
    note: "Menu and prices as printed on the Fruit Cow board, plus house-made glutinous-rice toppings. Edit everything in assets/js/content.js",
    copyright: "Fruit Cow"
  }
};

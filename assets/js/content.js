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
    tagline: "Small-batch fruit & milk tea, naturally sweetened",
    /* The original artwork is the brand mark: drop the file in at this exact
       path and it appears everywhere, no code change. The vector emblem is
       the stand-in that ships in the meantime so the brand is never broken. */
    logo: "assets/img/fruit-cow-logo.jpg",
    logoFallback: "assets/img/logo-emblem.svg",
    logoAlt: "Fruit Cow logo",
    phone: "(000) 000-0000",
    email: "hello@fruitcow.example",
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
        handle: "@fruitcow",
        url: "https://instagram.com/yourhandle",
        icon: "assets/img/icon-instagram.svg"
      },
      {
        id: "wechat",
        label: "WeChat",
        handle: "FruitCowCN",
        url: "",
        qr: "assets/img/wechat-qr.png",
        icon: "assets/img/icon-wechat.svg"
      }
    ]
  },

  /* -------------------------------------------------------------------- hero */
  hero: {
    eyebrow: "Brewed daily · Sourced responsibly",
    heading: "Fruit, tea and nothing artificial.",
    subheading:
      "Single-origin leaves steeped in house, whole fruit pressed to order, " +
      "and sweetness you control. No artificial syrups, no shortcuts.",
    /* The original artwork fills the cover slot too; the vector emblem stands
       in until the file is there. A wide banner (roughly 1600x900) works
       equally well — point this at it instead. */
    image: "assets/img/fruit-cow-logo.jpg",
    imageFallback: "assets/img/logo-emblem.svg",
    primaryCta: { label: "View the menu", target: "#menu" },
    secondaryCta: { label: "Find a store", target: "#locations" }
  },

  /* ------------------------------------------------------------------ values */
  /* The strip under the hero. Delete the whole `values` block and the
     section disappears. `icon` is any image path you like. */
  values: [
    {
      icon: "assets/img/ink-bamboo.svg",
      title: "Single-origin tea",
      body: "Assam, oolong and jasmine sourced from named estates and steeped to a timer, never held past its prime."
    },
    {
      icon: "assets/img/ink-mango.svg",
      title: "Whole fruit, pressed daily",
      body: "Mango, lychee and passion fruit prepared each morning. If it isn't in season, it isn't on the board."
    },
    {
      icon: "assets/img/ink-citrus.svg",
      title: "Sweetness on your terms",
      body: "Five sweetness levels, cane sugar only, and dairy-free milks at no penalty to flavour."
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
  /* `id` is what menu items point at. Reorder these to reorder the menu. */
  categories: [
    { id: "signature", name: "Fruit Cow Signature", blurb: "The drinks we're known for" },
    { id: "milktea",   name: "Classic Milk Tea",    blurb: "Slow-steeped black, green & oolong" },
    { id: "fruittea",  name: "Fruit Tea",           blurb: "Fresh fruit, brewed tea, zero dairy" },
    { id: "frozen",    name: "Smoothies & Slushes", blurb: "Blended to order" },
    { id: "snack",     name: "Snacks",              blurb: "Small bites" }
  ],

  /* -------------------------------------------------------------------- menu */
  /* Add a drink by copying any block below and changing the values.
       prices      : one entry per size id from customizations.sizes
       price       : use this INSTEAD of `prices` for single-price items
       tags        : optional — "vegan" "gf" "dairy-free" "spicy" "new"
       featured    : optional — true promotes it to the top of its category
       soldOut     : optional — true greys it out and shows "Sold out"       */
  menu: [
    {
      name: "Strawberry Cow",
      category: "signature",
      description: "Fresh strawberries muddled into creamy milk tea with brown sugar boba.",
      prices: { S: 5.75, M: 6.50, L: 7.25 },
      tags: ["new"],
      featured: true
    },
    {
      name: "Mango Cow Swirl",
      category: "signature",
      description: "Alphonso mango purée layered over jasmine milk tea, topped with mango pearls.",
      prices: { S: 6.00, M: 6.75, L: 7.50 },
      featured: true
    },
    {
      name: "Lychee Rose Milk Tea",
      category: "signature",
      description: "Lychee and rose syrup with oolong milk tea and aloe vera.",
      prices: { S: 6.00, M: 6.75, L: 7.50 }
    },

    {
      name: "Classic Black Milk Tea",
      category: "milktea",
      description: "Assam black tea steeped 12 minutes, whole milk, your sweetness.",
      prices: { S: 4.50, M: 5.25, L: 6.00 },
      featured: true
    },
    {
      name: "Brown Sugar Boba Milk",
      category: "milktea",
      description: "Tiger-striped brown sugar syrup, warm tapioca pearls, cold milk. No tea.",
      prices: { S: 4.75, M: 5.50, L: 6.25 },
      tags: ["gf"]
    },
    {
      name: "Jasmine Green Milk Tea",
      category: "milktea",
      description: "Lightly floral jasmine green tea with a smooth milk finish.",
      prices: { S: 4.50, M: 5.25, L: 6.00 }
    },
    {
      name: "Taro Milk Tea",
      category: "milktea",
      description: "Creamy taro blended with black tea. Naturally purple, naturally good.",
      prices: { S: 4.75, M: 5.50, L: 6.25 },
      tags: ["vegan"]
    },
    {
      name: "Matcha Milk Tea",
      category: "milktea",
      description: "Ceremonial-grade matcha whisked to order over your choice of milk.",
      prices: { S: 5.25, M: 6.00, L: 6.75 }
    },

    {
      name: "Passion Fruit Green Tea",
      category: "fruittea",
      description: "Tart passion fruit and green tea with real seeds and aloe.",
      prices: { S: 4.75, M: 5.50, L: 6.25 },
      tags: ["vegan", "dairy-free"]
    },
    {
      name: "Grapefruit Oolong",
      category: "fruittea",
      description: "Hand-peeled grapefruit segments in roasted oolong.",
      prices: { S: 5.25, M: 6.00, L: 6.75 },
      tags: ["vegan", "dairy-free"]
    },
    {
      name: "Peach Blossom Tea",
      category: "fruittea",
      description: "White peach and osmanthus over chilled green tea.",
      prices: { S: 4.75, M: 5.50, L: 6.25 },
      tags: ["vegan", "dairy-free"],
      soldOut: true
    },

    {
      name: "Strawberry Banana Smoothie",
      category: "frozen",
      description: "Whole strawberries, banana and oat milk. No added sugar.",
      prices: { M: 6.50, L: 7.50 },
      tags: ["vegan", "gf"]
    },
    {
      name: "Mango Slush",
      category: "frozen",
      description: "Mango purée and lime, crushed ice, finished with popping boba.",
      prices: { M: 6.00, L: 7.00 },
      tags: ["vegan", "dairy-free"]
    },

    {
      name: "Mochi Bites (3 pc)",
      category: "snack",
      description: "Choose mango, strawberry or matcha.",
      price: 4.25,
      tags: ["gf"]
    },
    {
      name: "Egg Waffle",
      category: "snack",
      description: "Made to order, crisp outside, custardy inside. Add boba for $1.50.",
      price: 5.50
    }
  ],

  /* ----------------------------------------------------------- customizations */
  /* These show in the "Build your drink" section. `sizes` ids must match
     the keys you use in each menu item's `prices`. */
  customizations: {
    sizes: [
      { id: "S", label: "Small", detail: "12 oz" },
      { id: "M", label: "Medium", detail: "16 oz" },
      { id: "L", label: "Large", detail: "24 oz" }
    ],
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
      { id: "extra", label: "Extra ice" },
      { id: "hot",   label: "Hot" }
    ],
    toppings: [
      { id: "boba",    label: "Tapioca boba",     addPrice: 0.75 },
      { id: "popping", label: "Popping boba",     addPrice: 0.75 },
      { id: "jelly",   label: "Coconut jelly",    addPrice: 0.75 },
      { id: "aloe",    label: "Aloe vera",        addPrice: 0.75 },
      { id: "pudding", label: "Egg pudding",      addPrice: 1.00 },
      { id: "cream",   label: "Sea salt cream",   addPrice: 1.25 }
    ],
    milks: [
      { id: "whole", label: "Whole milk" },
      { id: "oat",   label: "Oat milk",     addPrice: 0.75 },
      { id: "almond",label: "Almond milk",  addPrice: 0.75 },
      { id: "soy",   label: "Soy milk",     addPrice: 0.75 }
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
       options: ["sweetness", "ice"]
     Items priced with `prices` (per size) get the full drink options by
     default; single-`price` items get quantity and notes only.               */
  ordering: {
    enabled: true,
    mode: "slip",
    endpoint: "",
    prepTime: "10–15 minutes",
    confirmationMessage: "Thanks! Your order is in — have it ready at pickup.",
    notesPlaceholder: "Allergies, extra ice, anything else we should know?",
    paymentMethods: ["Cash at pickup", "Card at pickup"],
    minOrder: 0
  },

  /* ---------------------------------------------------------------- locations */
  locations: [
    {
      name: "Sample Flagship",
      address: "000 Example Street, Your City, ST 00000",
      phone: "(000) 000-0000",
      hours: {
        mon: "11:00 AM – 9:00 PM",
        tue: "11:00 AM – 9:00 PM",
        wed: "11:00 AM – 9:00 PM",
        thu: "11:00 AM – 10:00 PM",
        fri: "11:00 AM – 11:00 PM",
        sat: "11:00 AM – 11:00 PM",
        sun: "12:00 PM – 8:00 PM"
      }
    }
  ],

  /* ------------------------------------------------------------------- footer */
  footer: {
    note: "Prices and availability vary by location. Sample data — replace in assets/js/content.js",
    copyright: "Fruit Cow"
  }
};

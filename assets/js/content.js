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
    tagline: "Fresh fruit tea & milk tea, made to order",
    /* Drop your graphic at assets/img/fruit-cow-logo.png and it appears
       automatically. Until then the site shows a labelled placeholder. */
    logo: "assets/img/fruit-cow-logo.png",
    logoAlt: "Fruit Cow logo",
    phone: "(000) 000-0000",
    email: "hello@fruitcow.example",
    instagram: "@fruitcow",
    currency: "$"
  },

  /* -------------------------------------------------------------------- hero */
  hero: {
    eyebrow: "Now open",
    heading: "Fruit first. Always.",
    subheading:
      "Real fruit, brewed-in-house tea, and milk tea the way you like it — " +
      "pick your sweetness, pick your ice, pick your toppings.",
    /* Drop a wide banner at assets/img/hero.png (roughly 1600x900) and it
       appears automatically. Placeholder shows until you do. */
    image: "assets/img/hero.png",
    primaryCta: { label: "See the menu", target: "#menu" },
    secondaryCta: { label: "Find a store", target: "#locations" }
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

# Fruit Cow

Editable online milk tea ordering website for Fruit Cow.

No build step. Plain HTML, CSS and JavaScript — change a file, refresh the browser.

## Run it

```bash
npm start          # dev server on http://localhost:8000 — reloads itself when you save
npm test           # 37 checks against the real page
npm run serve      # plain static server, no file watching
```

Or just open `index.html` in a browser.

## Where your input goes

**One file: [`assets/js/content.js`](assets/js/content.js).**

Everything the site shows and sells comes from there — business name, menu
items, prices, descriptions, sizes, sweetness levels, toppings, hours,
locations, and how checkout behaves. Edit it, save, and the open page refreshes
itself.

The file is currently filled with **sample data**. Overwrite it with your real
menu. The site validates the file on load and prints plain-English warnings to
the browser console if an edit breaks something (wrong category, a quoted
price, a size that doesn't exist, a duplicate drink name), rather than
rendering a blank page.

### Add a drink

```js
{
  name: "Strawberry Cow",
  category: "signature",              // must match an id in categories[]
  description: "What's in it.",
  prices: { S: 5.75, M: 6.50, L: 7.25 },  // per size — keys match customizations.sizes
  tags: ["new"],                      // optional: vegan, gf, dairy-free, new
  featured: true                      // optional: floats to the top of its category
}
```

Single-price items (snacks, food) use `price` instead of `prices`:

```js
{ name: "Egg Waffle", category: "snack", description: "Made to order.", price: 5.50 }
```

Add `soldOut: true` to grey an item out — it also stops the item being
orderable. Delete the whole block to remove a drink.

Items priced with `prices` get the full drink customizer (size, sweetness, ice,
milk, toppings). Single-`price` items get quantity and notes only. Override
that per item with `options: ["sweetness", "ice"]`.

### Rules that cause a blank menu if broken

1. Strings in quotes: `"Brown Sugar Boba"`
2. Commas between items — missing commas are the most common error
3. `category` must match an `id` in `categories`
4. Prices are bare numbers: `6.5` — not `"$6.50"`, not `"6.50"`
5. Size keys must match the `id`s in `customizations.sizes`
6. Two items can't share a name

## Taking orders

The `ordering` block in `content.js` controls checkout:

```js
ordering: {
  enabled: true,        // false hides every Add button and the cart
  mode: "slip",         // "slip" or "endpoint"
  endpoint: "",         // used when mode is "endpoint"
  prepTime: "10–15 minutes",
  paymentMethods: ["Cash at pickup", "Card at pickup"]
}
```

Two ways orders reach you:

- **`"slip"`** — no server needed. The customer gets a formatted order slip they
  can copy, email, or show at the counter. Works the moment you deploy.
- **`"endpoint"`** — the order is POSTed as JSON to `endpoint`. Drop in a
  Formspree or Google Form URL, or your own backend. Set the URL or checkout
  will say so out loud instead of silently losing the order.

Prices are always recomputed from `content.js`, so changing a price never
leaves a customer's saved cart at a stale total, and a drink you delete
disappears from anyone's cart.

## Your graphic

Drop files at these paths and they appear automatically — no code changes:

| File | Used for |
| --- | --- |
| `assets/img/fruit-cow-logo.png` | Header logo + favicon (square, ~512×512) |
| `assets/img/hero.png` | Homepage banner (wide, ~1600×900) |

Until a file exists, that slot shows a dashed placeholder naming the exact path
to drop it into. Replace the file and the placeholder disappears on its own.

Any path works too — point `business.logo` or `hero.image` in `content.js` at
whatever file you have, e.g. `"assets/img/my-logo.webp"`.

## Keeping the live site up to date

Two layers, both already set up:

**While editing** — `npm start` runs [`dev-server.js`](dev-server.js), which
watches `index.html` and `assets/`. Save a file and any open browser reloads
itself within a second. Nothing to remember.

**Publishing** — [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
runs the tests and publishes the site to GitHub Pages on every push to `main`.
So the path is:

```bash
# edit assets/js/content.js, save, watch it change in the browser
git add -A && git commit -m "Spring menu"
git push origin main
```

…the live site updates itself a minute later. Nothing to upload.

One-time GitHub setup: **Settings → Pages → Source → GitHub Actions**.

The pipeline copies only `index.html` and `assets/` — not tests or
`node_modules` — and refuses to deploy if a test fails.

## Social placeholders

The `business.social` list in `content.js` drives both the header icons and the
footer block:

```js
social: [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@fruitcow",
    url: "https://instagram.com/yourhandle",   // "" = show the handle, no link
    icon: "assets/img/icon-instagram.svg"
  },
  {
    id: "wechat",
    label: "WeChat",
    handle: "FruitCowCN",
    url: "",
    qr: "assets/img/wechat-qr.png",            // optional, shown large in the footer
    icon: "assets/img/icon-wechat.svg"
  }
]
```

Add a third platform by copying a block. **Drop your WeChat QR code at
`assets/img/wechat-qr.png`** and it appears in the footer; until then that slot
shows a dashed placeholder naming the exact file to drop in. Delete the whole
`social` list and both the icons and the footer block disappear.

## Look and feel

Dark wood print, rice paper, and terraced fields, with **wood cross sections**
(end grain) printed behind the locations band and the **logo's meadow** — swirling
contour grass with upright tufts — printed behind the proof-point strip. The
hand-drawn **emblem** is the brand mark and fills the cover slot. The palette runs a full
complementary range — **indigo, azure, turquoise** against **orange, saffron,
straw and gold** — but stays disciplined: orange carries the actions, indigo
carries prices, and the rest appear only in tags, hairlines and the long curve
divider. Curves throughout: arched card tops, pill buttons, circular steppers,
and a cover that flows into the page on a curved foot. Type is **Fraunces**
(display serif) over **Inter** (body), falling back to Georgia and system-ui.

Three places to change it:

**1. Colours and fonts** — the `:root` block at the top of
[`assets/css/styles.css`](assets/css/styles.css). The palette is grouped:
`--wood-*`, `--paper`, `--indigo-*`, `--turquoise-*`, `--azure-*`,
`--orange-*`, `--saffron`, `--amber`, `--straw`, `--gold`, plus the ones taken
straight off the logo: `--sky`, `--grass`, `--grass-soft`, `--grass-deep` and
`--brand-brown` (which colours the wordmark and frames the emblem).

**2. Artwork** — the `decor` block in `content.js`. Every entry is a file path;
replace the file at that path with your own drawing, same filename, and it
appears everywhere. Set an entry to `""` to switch that piece off.

```js
decor: {
  seal: "assets/img/seal.svg",                        // stamp beside the brand
  heroArt: "assets/img/ink-rice.svg",                 // large drawing in the cover
  heroAccent: "assets/img/ink-plum.svg",              // smaller, opposite corner
  heroFruit: "assets/img/ink-peach.svg",              // third cover drawing
  terraces: "assets/img/ink-terraces.svg",            // 梯田 across the cover's foot
  woodring: "assets/img/ink-woodring.svg",            // one large timber slice
  divider: "assets/img/curve-wave.svg",               // long curve between sections
  ricePattern: "assets/img/pattern-rice.svg",         // grains over the page paper
  ringPattern: "assets/img/pattern-woodring.svg",     // end grain behind locations
  grassPattern: "assets/img/pattern-grass.svg",       // the logo's meadow, behind values
  coverWood: "assets/img/pattern-wood-dark.svg",      // dark print behind the cover
  cardWood: "assets/img/pattern-wood-oak.svg",        // grain under each menu card
  optionsWood: "assets/img/pattern-wood-walnut.svg",  // grain under each drink option
  stickers: [
    { src: "assets/img/sticker-rice.svg",   area: "cover",     rotate: -12 },
    { src: "assets/img/sticker-citrus.svg", area: "cover",     rotate: 14 },
    { src: "assets/img/sticker-lychee.svg", area: "values",    rotate: -8 },
    { src: "assets/img/deco-cow.svg",       area: "values",    rotate: -4 },
    { src: "assets/img/sticker-rice.svg",   area: "menu",      rotate: 10 },
    { src: "assets/img/sticker-citrus.svg", area: "locations", rotate: -14 }
  ]
}
```

**3. Stickers** — `area` is one of `cover`, `values`, `menu`, `locations`, and
`rotate` is degrees. Add as many as you like; the second one in any area is
offset automatically. Empty the list and they all disappear.

**4. Patterns** — the wood prints, the end grain, the rice scatter and the
meadow are all tileable. The straight-grain prints are generated with
`feTurbulence`; the end grain and the grass are drawn instead, because a filter
warp would break the tile seam. No photos, so nothing to licence.

**5. Brand** — `business.logo` and `hero.image` both point at
`assets/img/fruit-cow-logo.jpg`, the original artwork. **Drop your file at that
path and it appears in the header and the cover with no code change.** Until it
is there, `logoFallback` / `imageFallback` show `assets/img/logo-emblem.svg`,
the vector stand-in that ships with the repo, so the brand is never broken. A
missing stand-in still falls back to the labelled placeholder. Use a different
filename by changing `logo` / `image`.

Available fruit, if you want to swap any of them in: `ink-mango`, `ink-lychee`,
`ink-citrus`, `ink-peach`, `ink-plum`, plus `ink-rice`, `ink-bamboo`,
`ink-terraces`, the `deco-cow` and the `logo-emblem`. The proof-point strip under the cover comes from the `values`
block in `content.js`; delete it and the section disappears.

## Layout

```
index.html                       page shell, loads the three scripts below
assets/js/content.js             ← YOUR CONTENT
assets/js/app.js                 renders content.js into the page
assets/js/cart.js                cart, customizer, checkout
assets/css/styles.css            colours and fonts in :root at the top
assets/img/                      your logo & hero go here, plus the ink
                                 artwork and tileable wood patterns
dev-server.js                    static server with live reload
.github/workflows/deploy.yml     test + publish to GitHub Pages
tests/                           boots the real page in jsdom and checks it
```

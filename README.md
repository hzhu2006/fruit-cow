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

## Look and feel

Warm wood and natural paper, with mango and citrus held back as decoration
rather than loud colour. The primary action is botanical green; the fruit tones
only accent. Type is **Fraunces** (display serif) over **Inter** (body), with
Georgia and system-ui fallbacks if the webfonts can't load.

Everything is controlled from two places:

- **Colours and fonts** — the `:root` block at the top of
  [`assets/css/styles.css`](assets/css/styles.css). Change `--wood-800`,
  `--mango`, `--leaf` or the font stacks there and the whole site follows.
- **Decorative fruit** — the SVGs in `assets/img/`: `deco-mango.svg`,
  `deco-citrus.svg`, `deco-leaf.svg`, and `texture-grain.svg` (the faint paper
  grain over the page). Replace any of them with your own artwork, same
  filename, and it appears everywhere it's used.

The proof-point strip under the hero comes from the `values` block in
`content.js`. Delete that block and the section disappears.

## Layout

```
index.html                       page shell, loads the three scripts below
assets/js/content.js             ← YOUR CONTENT
assets/js/app.js                 renders content.js into the page
assets/js/cart.js                cart, customizer, checkout
assets/css/styles.css            colours live in :root at the top
assets/img/                      your graphics go here
dev-server.js                    static server with live reload
.github/workflows/deploy.yml     test + publish to GitHub Pages
tests/                           boots the real page in jsdom and checks it
```

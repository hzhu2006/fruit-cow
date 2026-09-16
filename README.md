# Fruit Cow

Editable online milk tea ordering website for Fruit Cow.

No build step. Plain HTML, CSS and JavaScript — change a file, refresh the browser.

## Run it

```bash
npm start          # serves on http://0.0.0.0:8000
npm test           # 12 checks against the real page
```

Or just open `index.html` in a browser.

## Where your input goes

**One file: [`assets/js/content.js`](assets/js/content.js).**

Everything the site shows comes from there — business name, menu items, prices,
descriptions, sizes, toppings, hours, locations. Edit it, save, refresh.

The file is currently filled with **sample data**. Overwrite it with your real
menu. The site validates the file on load and prints plain-English warnings to
the browser console if an edit breaks something (wrong category, a quoted
price, a size that doesn't exist), rather than rendering a blank page.

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

Add `soldOut: true` to grey an item out. Delete the whole block to remove a drink.

### Rules that cause a blank menu if broken

1. Strings in quotes: `"Brown Sugar Boba"`
2. Commas between items — missing commas are the most common error
3. `category` must match an `id` in `categories`
4. Prices are bare numbers: `6.5` — not `"$6.50"`, not `"6.50"`
5. Size keys must match the `id`s in `customizations.sizes`

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

## Layout

```
index.html                  page shell, loads the two scripts below
assets/js/content.js        ← YOUR CONTENT
assets/js/app.js            renders content.js into the page
assets/css/styles.css       colours live in :root at the top
assets/img/                 your graphics go here
tests/site.test.mjs         boots the real page in jsdom and checks it
```

## Colours

Change the palette in one place — the `:root` block at the top of
[`assets/css/styles.css`](assets/css/styles.css).

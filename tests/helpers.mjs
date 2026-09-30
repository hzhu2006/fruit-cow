/* Shared test helpers: boot the REAL page (real content.js + app.js + cart.js). */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const INDEX = path.join(ROOT, "index.html");

/**
 * Boot the actual page in a real DOM.
 * NOTE: no `url` option — JSDOM.fromFile gives a file:// URL so the relative
 * <script src="assets/js/..."> tags load from disk. Setting a url here would
 * make jsdom try to fetch them over HTTP and nothing would run.
 */
export async function bootPage() {
  const dom = await JSDOM.fromFile(INDEX, {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
  });

  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const { SITE_CONTENT, FruitCow } = dom.window;
    if (SITE_CONTENT && FruitCow && dom.window.document.querySelector(".fc-card")) return dom;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error(
    "page never finished booting — SITE_CONTENT=" + typeof dom.window.SITE_CONTENT +
    ", FruitCow=" + typeof dom.window.FruitCow
  );
}

/**
 * Values coming out of the jsdom realm carry that realm's prototypes, which
 * makes deepStrictEqual reject them even when the contents match. Round-trip
 * through JSON to compare plain data on equal terms.
 */
export const own = (value) => JSON.parse(JSON.stringify(value));

/** Click a real DOM node the way a user would. */
export function click(dom, node) {
  node.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
}

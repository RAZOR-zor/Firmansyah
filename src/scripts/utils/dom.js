/**
 * Selector & event helper.
 * @module utils/dom
 */

/**
 * @param {string} sel
 * @param {ParentNode} [scope]
 * @returns {Element|null}
 */
export const qs = (sel, scope = document) => scope.querySelector(sel);

/**
 * @param {string} sel
 * @param {ParentNode} [scope]
 * @returns {Element[]}
 */
export const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

/**
 * Delegated listener. Satu listener untuk banyak elemen — lebih murah
 * daripada attach per item, dan otomatis berlaku untuk node baru.
 *
 * @param {string} sel
 * @param {string} type
 * @param {(target: Element, event: Event) => void} handler
 * @param {ParentNode} [scope]
 * @returns {() => void} fungsi lepas
 */
export function on(sel, type, handler, scope = document) {
  /** @param {Event} e */
  const listener = (e) => {
    // `e.target` belum tentu Element — bisa berupa Document saat tetikus
    // masuk atau keluar dari jendela, atau Text Node. Karena itu selalu
    // dinormalkan dulu sebelum memanggil closest().
    const origin = e.target instanceof Element ? e.target : e.target instanceof Node ? e.target.parentElement : null;
    const target = origin?.closest(sel);
    if (target && scope.contains(target)) handler(target, e);
  };
  scope.addEventListener(type, listener);
  return () => scope.removeEventListener(type, listener);
}

/**
 * Bikin elemen beserta atribut dan anak, tanpa innerHTML.
 * @param {string} tag
 * @param {{ class?: string, text?: string, html?: string, attrs?: Record<string,string>, children?: Node[] }} [opt]
 * @returns {HTMLElement}
 */
export function el(tag, opt = {}) {
  const node = document.createElement(tag);
  if (opt.class) node.className = opt.class;
  if (opt.text !== undefined) node.textContent = opt.text;
  if (opt.html !== undefined) node.innerHTML = opt.html;
  if (opt.attrs) for (const [k, v] of Object.entries(opt.attrs)) node.setAttribute(k, v);
  if (opt.children) node.append(...opt.children);
  return node;
}

/**
 * Buang anak dari sebuah node.
 * @param {Element} node
 */
export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/**
 * Debounce sederhana.
 * @param {(...a: any[]) => void} fn
 * @param {number} wait
 */
export function debounce(fn, wait = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

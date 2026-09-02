/** @param {string} source */
export function prepareMarkdown(source) {
  return source
    .replace(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

/** @param {string} value */
export function parseTaskText(value) {
  const marker = /^\[([ xX])\][ \t]+/.exec(value);
  if (!marker) return null;
  return { checked: marker[1] !== " ", text: value.slice(marker[0].length) };
}

/** @param {boolean} hidden */
export function paragraphSeparator(hidden) {
  return hidden ? "\n" : "\n\n";
}

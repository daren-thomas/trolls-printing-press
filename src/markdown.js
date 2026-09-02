/** @param {string} source */
export function prepareMarkdown(source) {
  return source
    .replace(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * Resolve Typst language settings from top-level YAML frontmatter.
 * English is deliberately the default; German opts into Swiss spelling unless
 * the author supplies a region such as de-DE or de-AT.
 * @param {string} source
 * @returns {{ language: string, region: string }}
 */
export function resolveDocumentLanguage(source) {
  const frontmatter = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source)?.[1] ?? "";
  const value = /^(?:language|lang)[ \t]*:[ \t]*(.+?)[ \t]*$/im.exec(frontmatter)?.[1]
    ?.trim()
    .replace(/^(["'])(.*)\1$/, "$2")
    .toLowerCase();

  if (!value) return { language: "en", region: "US" };
  if (value === "german" || value === "deutsch" || value === "de") return { language: "de", region: "CH" };
  const locale = /^([a-z]{2,3})[-_]([a-z]{2})$/i.exec(value);
  if (locale) return { language: locale[1].toLowerCase(), region: locale[2].toUpperCase() };
  if (value === "english" || value === "en") return { language: "en", region: "US" };
  return { language: "en", region: "US" };
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

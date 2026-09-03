/** @param {string} source */
export function prepareMarkdown(source) {
  return source
    .replace(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

/** @param {string} _match @param {string} target @param {string} label */
function aliasedHeadingLink(_match, target, label) {
  return `[${label}](#${encodeURI(target)})`;
}

/** @param {string} _match @param {string} target */
function headingLink(_match, target) {
  return `[${target}](#${encodeURI(target)})`;
}

/** @param {string} _match @param {string} target */
function embeddedResource(_match, target) {
  return `![](${encodeURI(target)})`;
}

/** Preserve same-document wikilinks as Markdown links; cross-note links remain readable text.
 * @param {string} value
 */
export function displayWikilinks(value) {
  return value
    .replace(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, embeddedResource)
    .replace(/\[\[#([^\]|]+)\|([^\]]+)\]\]/g, aliasedHeadingLink)
    .replace(/\[\[#([^\]]+)\]\]/g, headingLink)
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1");
}

/** Produce an ASCII-only Typst label for a Markdown heading or anchor target.
 * @param {string} value
 */
export function headingLabel(value) {
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { /* Keep malformed input readable and stable. */ }
  const normalized = decoded.trim().normalize("NFC").toLowerCase();
  let hash = 0x811c9dc5;
  for (const character of normalized) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return `heading-${(hash >>> 0).toString(16).padStart(8, "0")}`;
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

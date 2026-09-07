import { parse } from "yaml";

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

/** Obsidian's embed alias is either a pixel size, which print ignores, or a
 * word such as `wide` that the layout reads as a placement hint.
 * @param {string} _match @param {string} target @param {string | undefined} alias */
function embeddedResource(_match, target, alias) {
  const hint = alias && !/^\d+(?:x\d+)?$/.test(alias.trim()) ? alias.trim() : "";
  return `![${hint}](${encodeURI(target)})`;
}

/** Preserve same-document wikilinks as Markdown links; cross-note links remain readable text.
 * @param {string} value
 */
export function displayWikilinks(value) {
  return value
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, embeddedResource)
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

/** A paragraph consisting only of scissors and a rule asks for a new page.
 * The typographer may already have turned the dashes into a dash character.
 * @param {string} value
 */
export function isPageBreak(value) {
  return /^✂️?[ \t]*(?:-{3,}|—|–)[ \t]*$/u.test(value.trim());
}

/** Whether an image placement hint asks the picture to span all columns.
 * @param {string} hint
 */
export function spansColumns(hint) {
  return /\bwide\b/i.test(hint);
}

/** Split many short list items into columns of near-equal length, top to bottom.
 * @template T
 * @param {T[]} items
 * @param {number} columns
 * @returns {T[][]}
 */
export function balanceColumns(items, columns) {
  const perColumn = Math.ceil(items.length / columns);
  const chunks = [];
  for (let start = 0; start < items.length; start += perColumn) chunks.push(items.slice(start, start + perColumn));
  return chunks;
}

/** Long lists of short entries, such as name tables, waste a page when set in one
 * column. Sixteen or more single-line items under thirty-two characters qualify.
 * @param {string[]} items
 */
export function isShortList(items) {
  return items.length >= 16 && items.every((item) => item.length <= 32 && !item.includes("\n"));
}

/** Read one scalar value from the top-level YAML frontmatter, or null when absent.
 * @param {string} source
 * @param {string} key
 * @returns {string | null}
 */
export function frontmatterValue(source, key) {
  const frontmatter = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(source)?.[1] ?? "";
  const metadata = parse(frontmatter);
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const value = metadata[key];
  if (typeof value !== "string" && typeof value !== "number") return null;
  return String(value).trim() || null;
}

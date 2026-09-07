# Styling pass and two-column books

## Plan
- [x] base.typ: list/paragraph spacing, ragged list items, `size` param, `picture()` with height cap and column-spanning floats
- [x] book.typ: title block, outer-edge page numbers, 10pt body, optional two columns (`$columns$`, `$size$`)
- [x] index-card.typ / session-note.typ: pass size and image limits
- [x] converter: `✂️---` page break, `![[img|wide]]` spanning images, long simple lists in columns
- [x] publisher: card auto-fit (retry smaller sizes), two-column book/booklet entry points
- [x] main.ts: two-column book and booklet commands
- [x] tests + README
- [x] verify with the render harness on the four vault notes
- [x] Bundle Alegreya Bold / Bold Italic (instanced at wght 700 from the local variable fonts with fontTools; download was blocked)

## Original styling review
- All four vault notes re-rendered through the harness in the scratchpad; 29/29 tests pass; `npm run build` succeeds.
- Monsters cards 35 -> 30 pages, Magical Loot 9 -> 7 pages, Journal book unchanged at 14 pages, two-column Journal 11 pages.
- Open follow-ups: column balancing on a document's last page is not possible in Typst; `wide` only applies inside
  two-column layouts (single-column books ignore it); a `wide` picture placed right before `✂️---` may end up alone on
  a page because floats cannot cross the page break.

## Pre-commit fixes (2026-09-07)
- [x] Parse book title/subtitle as YAML, including comments and multiline scalars.
- [x] Recognize document-level scissors markers without surrounding blank lines; preserve code/list/quote contents.
- [x] Remove the card padding container that prevented explicit page breaks from compiling.
- [x] Allow ordinary tables to paginate regardless of row count, avoiding oversized unbreakable tables.
- [x] Give two-column books and booklets distinct output filenames.
- [x] Correct the README's image pagination guarantee and document the wide-image/page-break limitation.
- [x] Normalize changed text files to LF and add `.gitattributes` to keep line endings stable.
- [x] Add converter regression tests and actual PDF rendering checks for all layouts, wide images, and card sizes.
- Validation: 48/48 tests pass; `npm run build` and `git diff --check` succeed.
- The earlier four-vault-note visual comparisons above were not repeated during these fixes.

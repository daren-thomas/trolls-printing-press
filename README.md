# Trolls' Printing Press

Create print-ready session notes, reference sheets, index cards, books, and
booklets from Markdown inside Obsidian.

Trolls' Printing Press keeps Markdown as the canonical source and uses a
bundled Typst WebAssembly compiler for reproducible print layouts. It includes
the publishing profiles developed for tabletop RPG session preparation and
small-format rulebooks.

## Publishing profiles

- **Publish active note** creates a compact, two-column A4 session sheet.
- **Publish active note as book** creates an A5 reading PDF.
- **Publish active note as booklet** creates the A5 PDF and imposes it onto A4
  landscape sheets for duplex printing and saddle stitching.
- **Publish active note as two-column book** and **… as two-column booklet**
  flow the A5 pages in two columns at session-sheet density, for list-heavy
  journals.
- **Publish index cards** treats every level-one heading in the active note as
  an A6 landscape card and combines the cards into one PDF.

Generated PDFs are written to `publishing/output` beneath the active note's
folder by default. The destination is configurable in the plugin settings.
Two-column books use `-two-column.pdf`; their booklets use
`-two-column-booklet.pdf`, so they can coexist with the single-column versions.

## Layout hints in Markdown

The Markdown stays readable in Obsidian; a few conventions steer the print
layout.

- `✂️---` on a line of its own starts a new page (or a new card page).
- Books take their printed title from a `title:` frontmatter field when present, and
  a `subtitle:` field is set beneath it on the first page.
- `![[map.png|wide]]` lets a picture span both columns of a two-column
  layout. Without the hint a picture stays inside its column. Picture height
  is capped, but pictures can still move following text onto another page.
  A wide picture immediately before a page break may occupy a page on its own.
- Lists of sixteen or more short entries, such as name tables, are set in
  two or three columns automatically.
- Index cards shrink their body type in small steps when a card overflows by a
  few lines, so a stat block that almost fits stays on one card.

## Opinionated by design

The printing press supplies its own layouts, fonts, Markdown conversion rules,
and PDF tooling. Templates and typography are not configurable. This keeps the
output predictable and lets every profile be designed and tested as a whole.
Session notes use Alegreya for body copy and Alegreya Sans for headings.

No external programs are required. Typst, the fonts, PDF merging, and booklet
imposition are bundled with the plugin and run locally. Publishing does not
send note contents over the network.

The initial release is desktop-only while the bundled worker runtime is tested
across Obsidian's desktop platforms.

## Booklet printing

Print the `-booklet.pdf` file double-sided at actual size. Use landscape paper,
flip on the short edge, fold the sheets down the middle, and nest them in order.

## Development

```powershell
npm install
npm run lint
npm run build
npm test
```

For local development, clone the repository directly into an Obsidian vault's
`.obsidian/plugins/trolls-printing-press` directory and run `npm run dev`.

For a clean installation check, run `npm run prepare:test-vault` after building,
then open the generated `test-vault` folder as a vault in Obsidian. It contains
only the release assets and a sample note for exercising all six publishing
commands. The test vault is ignored by Git.

Enable community plugins in that vault. With Obsidian's CLI enabled, run the
installation and lifecycle checks from PowerShell:

```powershell
obsidian vault=test-vault eval code="eval(require('fs').readFileSync(require('path').join(app.vault.adapter.getBasePath(),'../scripts/check-test-vault.js'),'utf8'))"
```

The check regenerates six PDFs, verifies settings persistence, and checks that
disabling the plugin removes its commands and terminates its compiler worker.

The production build bundles the Typst engine, fonts, and layouts into
`main.js`, because Obsidian installs only `main.js`, `manifest.json`, and the
optional `styles.css` from a plugin release.

## Installation

Until the plugin is available in Obsidian's community directory, install it
with [BRAT](https://github.com/TfTHacker/obsidian42-brat) using:

```text
daren-thomas/trolls-printing-press
```

## License

Trolls' Printing Press is released under the [MIT License](LICENSE). Bundled
components and fonts are covered by their respective licenses; see
[third-party notices](NOTICE.md).

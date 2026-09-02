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
- **Publish index cards** treats every level-one heading in the active note as
  an A6 landscape card and combines the cards into one PDF.

Generated PDFs are written to `publishing/output` beneath the active note's
folder by default. The destination is configurable in the plugin settings.

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
npm run build
npm test
```

For local development, clone the repository directly into an Obsidian vault's
`.obsidian/plugins/trolls-printing-press` directory and run `npm run dev`.

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

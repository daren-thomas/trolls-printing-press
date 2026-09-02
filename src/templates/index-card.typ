// A6 landscape monster cards. One level-one Markdown section becomes one card.

#set page(
  width: 148mm,
  height: 105mm,
  margin: (top: 9mm, bottom: 2.8mm, left: 2.8mm, right: 2.8mm),
  numbering: none,
  fill: white,
  header: none,
  background: context {
    let current-page = counter(page).get().first()
    let total-pages = counter(page).final().first()
    let displayed-title = if total-pages > 1 {
      upper("$title$") + " (" + str(current-page) + "/" + str(total-pages) + ")"
    } else {
      upper("$title$")
    }

    place(top + center, dy: 1.4mm)[
      #block(
        width: 142.4mm,
        fill: black,
        inset: (x: 0.5em, y: 0.16em),
        breakable: false,
      )[
        #grid(
          columns: (1fr, auto, 1fr),
          [],
          text(size: 16pt, weight: "bold", fill: white, displayed-title),
          [],
        )
      ]
    ]
  },
)
#set text(lang: "en", font: "Libertinus Serif", size: 8.5pt, fill: black)
#set par(justify: false, leading: 0.34em, spacing: 0.58em)
#set list(marker: none, indent: 0em, body-indent: 0em, spacing: 0.24em)
#set enum(numbering: (..numbers) => [], indent: 0em, body-indent: 0em, spacing: 0.24em)
#set table(
  inset: (x: 2.4pt, y: 1.8pt),
  stroke: none,
  fill: (x, y) => if y == 0 { luma(88%) } else { none },
)

#let ink = black
#let pale = luma(93%)

#show heading.where(level: 2): it => block(
  width: 100%,
  above: 0.85em,
  below: 0.38em,
  breakable: false,
  sticky: true,
)[
  #text(size: 11.5pt, weight: "bold", it.body)
]

#show heading.where(level: 3): it => block(
  width: 100%,
  above: 0.85em,
  below: 0.38em,
  breakable: false,
  sticky: true,
)[
  #text(size: 11.5pt, weight: "bold", it.body)
]

#show strong: it => text(weight: "bold", it.body)
#show emph: it => text(style: "italic", it.body)
#show link: it => it.body
#show table.cell.where(y: 0): set text(fill: ink, weight: "bold")
#show figure.where(kind: table): it => {
  set text(size: 8.5pt)
  set align(left)
  block(
    width: 100%,
    above: 0.68em,
    below: 0.72em,
    inset: (top: 0.28em, bottom: 0.28em),
    stroke: (top: 0.8pt + ink, bottom: 0.8pt + ink),
    breakable: false,
    it.body,
  )
}
#show quote: it => block(
  breakable: false,
  inset: (x: 3pt, y: 2pt),
  fill: pale,
  stroke: (left: 1.4pt + ink),
  it.body,
)
#show image: it => block(breakable: false, it)
#show figure.where(kind: image): it => it.body

#let ability-grid(..cells) = block(
  width: 100%,
  above: 0.48em,
  below: 0.58em,
  inset: (top: 0.28em, bottom: 0.28em),
  stroke: (top: 0.8pt + ink, bottom: 0.8pt + ink),
  breakable: false,
)[
  #table(
    columns: (auto, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr),
    align: (left, center, center, center, center, center, center),
    inset: (x: 0.55pt, y: 1.8pt),
    stroke: none,
    fill: (x, y) => if y == 0 { luma(88%) } else if x == 0 { luma(94%) } else { none },
    table.header(..cells.pos().slice(0, 7)),
    ..cells.pos().slice(7),
  )
]

#pad(top: 0.5em, columns(2, gutter: 2em)[$body$])

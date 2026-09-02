// Pandoc template for compact A5 books and booklets.
// Content comes from Markdown; this file owns the visual design.

#set document(title: [$title$])
#set page(
  paper: "a5",
  margin: (top: 15mm, bottom: 17mm, inside: 16mm, outside: 13mm),
  numbering: none,
  footer: context {
    let physical-page = counter(page).get().first()
    if physical-page > 1 {
      align(right, text(size: 7.5pt, str(physical-page - 1)))
    }
  },
  fill: white,
)
#set text(
  lang: "en",
  font: "Libertinus Serif",
  size: 9.2pt,
  fill: black,
)
#set par(justify: true, leading: 0.58em)
#set list(indent: 1.15em, body-indent: 0.55em, spacing: 0.32em)
#set enum(indent: 1.25em, body-indent: 0.55em, spacing: 0.32em)
#set table(
  inset: (x: 4pt, y: 3pt),
  stroke: (x: none, y: 0.55pt + black),
  fill: (_, row) => if row == 0 { black } else if calc.even(row) { luma(94%) },
)

#let ink = black
#let paper-grey = luma(92%)

#show heading.where(level: 1): it => {
  set align(center)
  set par(justify: false)
  set text(fill: ink, hyphenate: false)
  pagebreak(weak: true)
  v(22%)
  text(size: 24pt, weight: "bold", tracking: 0.025em, it.body)
  v(8mm)
  line(length: 58%, stroke: 2.4pt + ink)
  pagebreak()
}

#show heading.where(level: 2): it => {
  block(
    width: 100%,
    fill: ink,
    inset: (x: 7pt, y: 4.5pt),
    above: 1.15em,
    below: 0.65em,
    breakable: false,
  )[
    #text(size: 14pt, weight: "bold", fill: white, it.body)
  ]
}

#show heading.where(level: 3): it => {
  block(above: 0.9em, below: 0.35em, breakable: false)[
    #text(size: 11.5pt, weight: "bold", fill: ink, it.body)
    #v(-1.5pt)
    #line(length: 100%, stroke: 0.7pt + ink)
  ]
}

#show quote: it => block(
  width: 100%,
  inset: 9pt,
  radius: 2pt,
  fill: paper-grey,
  stroke: (left: 2.2pt + ink),
  above: 0.7em,
  below: 0.7em,
  it.body,
)

#show strong: it => text(weight: "bold", fill: ink, it.body)
#show link: it => underline(text(fill: ink, it.body))
#show table.cell.where(y: 0): set text(fill: white, weight: "bold")
// Pandoc centers tables in an `align` container. That container cannot
// break across pages, so unwrap it and let long RPG tables flow normally.
#show align: it => it.body
#show figure.where(kind: table): it => {
  set text(size: 7.6pt)
  v(0.55em)
  it.body
  v(0.7em)
}

$body$

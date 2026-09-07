// The Trolls' Printing Press house style.
// Output profiles own page geometry; this module owns the visual language.

#let ink = black
#let pale = luma(93%)

// Profiles declare how tall an embedded picture may grow and how many text
// columns they flow, so pictures can fit a column or span the whole page.
#let picture-limit = state("tpp-picture-limit", 60mm)
#let column-count = state("tpp-column-count", 1)

#let fitted-image(path, max-height) = layout(size => {
  let natural = measure(image(path, width: size.width)).height
  if natural > max-height {
    align(center, image(path, height: max-height))
  } else {
    image(path, width: size.width)
  }
})

#let picture(path, wide: false) = context {
  let limit = picture-limit.get()
  if wide and column-count.get() > 1 {
    place(top, float: true, scope: "parent", clearance: 0.7em, fitted-image(path, limit))
  } else {
    block(width: 100%, breakable: false, above: 0.6em, below: 0.6em, fitted-image(path, limit))
  }
}

// Lay the body out in columns. Typst forbids page breaks inside a column
// container, so the body is cut at each page break and every part gets its
// own container on a fresh page.
#let flow(columns: 1, gutter: 6mm, body) = {
  if columns <= 1 {
    body
  } else {
    let children = if body.has("children") { body.children } else { (body,) }
    let parts = ((),)
    for child in children {
      if child.func() == pagebreak { parts.push(()) } else { parts.at(parts.len() - 1).push(child) }
    }
    for (index, part) in parts.enumerate() {
      if index > 0 { pagebreak(weak: true) }
      std.columns(columns, gutter: gutter, part.join())
    }
  }
}

#let list-depth = state("tpp-list-depth", 0)

#let spaced-list(it) = {
  list-depth.update(depth => depth + 1)
  context {
    let nested = list-depth.get() > 1
    block(above: if nested { 0.58em } else { 0.5em }, below: if nested { 0.58em } else { 0.9em }, it)
  }
  list-depth.update(depth => depth - 1)
}

#let callout(kind: "note", title: none, body) = block(
  width: 100%,
  inset: (x: 7pt, y: 5pt),
  fill: pale,
  stroke: (left: 2.2pt + ink),
  above: 0.4em,
  below: 0.4em,
  breakable: false,
)[
  #set par(justify: false)
  #if title != none {
    text(font: "Alegreya Sans", size: 10.5pt, weight: "bold", title)
    v(2pt)
  }
  #body
]

#let ability-grid(..cells) = block(
  width: 100%,
  above: 0.35em,
  below: 0.5em,
  inset: (top: 0.2em, bottom: 0.2em),
  stroke: (top: 0.7pt + ink, bottom: 0.7pt + ink),
  breakable: false,
)[
  #show table.cell.where(y: 0): set text(fill: black, weight: "bold")
  #table(
    columns: (auto, 1fr, 1fr, 1fr, 1fr, 1fr, 1fr),
    align: (left, center, center, center, center, center, center),
    inset: (x: 0.5pt, y: 1.4pt),
    stroke: none,
    fill: (x, y) => if y == 0 { luma(88%) } else if x == 0 { luma(94%) } else { none },
    table.header(..cells.pos().slice(0, 7)),
    ..cells.pos().slice(7),
  )
]

#let house-style(
  language: "en",
  region: "US",
  size: 9.2pt,
  columns: 1,
  image-limit: 60mm,
  body,
) = {
  picture-limit.update(image-limit)
  column-count.update(columns)

  set text(lang: language, region: region, font: "Alegreya", size: size, fill: ink)
  set par(justify: true, leading: 0.58em)
  set list(marker: ([•], [–]), indent: 0em, body-indent: 0.55em, spacing: 0.7em)
  set enum(indent: 0em, body-indent: 0.55em, spacing: 0.7em)
  set table(
    inset: (x: 3pt, y: 2pt),
    stroke: (x: none, y: 0.45pt + ink),
    fill: (_, row) => if row == 0 { ink } else if calc.even(row) { luma(94%) },
  )

  // Items keep their tight rhythm inside a list, but a top-level list stands
  // clear of the paragraph that follows it. Narrow columns read better ragged.
  show list: set par(justify: false)
  show enum: set par(justify: false)
  show list: spaced-list
  show enum: spaced-list
  show heading.where(level: 1): it => block(width: 100%, below: 2.2mm, breakable: false)[
    #stack(
      dir: ttb,
      spacing: 0.8mm,
      text(font: "Alegreya Sans", size: 17pt, weight: "bold", it.body),
      line(length: 100%, stroke: 2.2pt + ink),
    )
  ]
  show heading.where(level: 2): it => block(
    width: 100%, fill: ink, inset: (x: 5pt, y: 3pt),
    above: 0.55em, below: 0.22em, breakable: false, sticky: true,
  )[
    #text(font: "Alegreya Sans", size: 11pt, weight: "bold", fill: white, it.body)
  ]
  show heading.where(level: 3): it => block(
    width: 100%, above: 0.58em, below: 1.6mm, breakable: false, sticky: true,
  )[
    #stack(
      dir: ttb,
      spacing: 0.5mm,
      text(font: "Alegreya Sans", size: 10.5pt, weight: "bold", it.body),
      line(length: 100%, stroke: 0.6pt + ink),
    )
  ]
  show quote: it => block(
    width: 100%, inset: (x: 6pt, y: 4pt), fill: pale,
    stroke: (left: 1.8pt + ink), above: 0.4em, below: 0.4em, it.body,
  )
  // Table cells are too narrow for justification or hyphenation to help.
  show table: set par(justify: false)
  show table: set text(hyphenate: false)
  show strong: it => text(weight: "bold", it.body)
  show emph: it => text(style: "italic", it.body)
  show table.cell.where(y: 0): set text(fill: white, weight: "bold")
  show align: it => it.body
  show figure.where(kind: table): it => { set text(size: 9pt); it.body }
  show image: it => block(breakable: false, it)
  show figure.where(kind: image): it => it.body

  body
}

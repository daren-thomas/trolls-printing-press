// A5 reading PDF; booklet imposition is handled after compilation.
// Flows one or two columns; two columns tighten the type to session-sheet density.
#import "base.typ": house-style, flow, ability-grid, callout, picture, ink

#let column-count = $columns$

#set document(title: [$title$])
#set page(
  paper: "a5",
  margin: (top: 15mm, bottom: 17mm, inside: 16mm, outside: 13mm),
  numbering: none,
  footer: context {
    let physical-page = counter(page).get().first()
    if physical-page > 1 {
      // Page numbers live on the outer edge: recto pages are odd.
      let edge = if calc.odd(physical-page) { right } else { left }
      align(edge, text(size: 7.5pt, str(physical-page)))
    }
  },
  fill: white,
)

#let reading = [$body$]

#house-style(language: "$language$", region: "$region$", size: $size$, columns: column-count, image-limit: 105mm)[
  #block(width: 100%, below: 6mm, breakable: false)[
    #stack(
      dir: ttb,
      spacing: 2mm,
      text(font: "Alegreya Sans", size: 22pt, weight: "bold", tracking: 0.01em)[$title$],
      line(length: 100%, stroke: 1.8pt + ink),
    )
    #let subtitle = [$subtitle$]
    #if subtitle != [] {
      v(2.5mm)
      text(size: 11.5pt, style: "italic", subtitle)
    }
  ]
  #flow(columns: column-count, gutter: 6mm, reading)
]

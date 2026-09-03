// Compact, two-column A4 session notes.
#import "base.typ": house-style, ability-grid, ink

#set document(title: [$title$])
#set page(paper: "a4", margin: 8mm, numbering: none, fill: white)

#house-style(language: "$language$", region: "$region$")[
  #block(width: 100%, below: 3mm, breakable: false)[
    #stack(
      dir: ttb,
      spacing: 1.5mm,
      text(font: "Alegreya Sans", size: 18pt, weight: "bold", tracking: 0.01em)[$title$],
      line(length: 100%, stroke: 1.8pt + ink),
    )
  ]
  #columns(2, gutter: 6mm)[$body$]
]

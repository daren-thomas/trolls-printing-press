// Compact, two-column A4 session notes.
#import "base.typ": house-style, flow, ability-grid, callout, picture, ink

#set document(title: [$title$])
#set page(paper: "a4", margin: 8mm, numbering: none, fill: white)

#house-style(language: "$language$", region: "$region$", columns: 2, image-limit: 120mm)[
  #block(width: 100%, below: 3mm, breakable: false)[
    #stack(
      dir: ttb,
      spacing: 1.5mm,
      text(font: "Alegreya Sans", size: 18pt, weight: "bold", tracking: 0.01em)[$title$],
      line(length: 100%, stroke: 1.8pt + ink),
    )
  ]
  #flow(columns: 2, gutter: 6mm)[$body$]
]

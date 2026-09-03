// A6 landscape cards. One level-one Markdown section becomes one card.
#import "base.typ": house-style, ability-grid

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
    } else { upper("$title$") }

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
          text(font: "Alegreya Sans", size: 15pt, weight: "bold", fill: white, displayed-title),
          [],
        )
      ]
    ]
  },
)

#house-style(language: "$language$", region: "$region$")[
  #pad(top: 0.5em, columns(2, gutter: 2em)[$body$])
]

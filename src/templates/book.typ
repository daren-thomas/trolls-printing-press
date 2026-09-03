// A5 reading PDF; booklet imposition is handled after compilation.
#import "base.typ": house-style, ability-grid

#set document(title: [$title$])
#set page(
  paper: "a5",
  margin: (top: 15mm, bottom: 17mm, inside: 16mm, outside: 13mm),
  numbering: none,
  footer: context {
    let physical-page = counter(page).get().first()
    if physical-page > 1 { align(right, text(size: 7.5pt, str(physical-page - 1))) }
  },
  fill: white,
)

#house-style(language: "$language$", region: "$region$")[
  $body$
]

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const vault = path.join(root, "test-vault");
const plugin = path.join(vault, ".obsidian", "plugins", "trolls-printing-press");
await fs.mkdir(plugin, { recursive: true });
for (const asset of ["main.js", "manifest.json"]) {
  await fs.copyFile(path.join(root, asset), path.join(plugin, asset));
}
await fs.writeFile(path.join(vault, ".obsidian", "community-plugins.json"), '["trolls-printing-press"]\n');
await fs.writeFile(path.join(vault, "Release check.md"), `---
title: The Printing Press # This comment must not print
subtitle: >-
  A clean installation
  check
---
# First card

**Bold**, *italic*, and ***bold italic*** text.

- One item
- Another item

| d6 | Result |
| --- | --- |
| 1–3 | A quiet road |
| 4–6 | An unexpected visitor |

![[map.svg|wide]]

Before the break
✂️---
After the break

# Second card

A fresh card with a [web link](https://obsidian.md).
`);
await fs.writeFile(path.join(vault, "map.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><rect width="300" height="100" fill="#ddd"/><path d="M0 80 L80 20 L180 80 L300 20" fill="none" stroke="black" stroke-width="4"/></svg>');
console.log(`Release assets installed in ${vault}`);

/**
 * Pivot a D&D STAT/SCORE/MOD/SAVE table into the shared compact ability grid.
 * Cells must already be escaped for Typst output.
 *
 * @param {string[][]} rows
 * @returns {string | null}
 */
export function compactAbilityTable(rows) {
  if (rows.length < 2) return null;
  const header = rows[0].map((cell) => cell.trim().toUpperCase());
  if (header.join("|") !== "STAT|SCORE|MOD|SAVE") return null;
  const abilities = rows.slice(1).filter((row) => row.length === 4);
  if (abilities.length !== 6) return null;

  const cells = ["[]", ...abilities.map((row) => `[${row[0]}]`)];
  for (const { label, column } of [
    { label: "SCORE", column: 1 },
    { label: "MOD", column: 2 },
    { label: "SAVE", column: 3 },
  ]) {
    cells.push(`[${label}]`, ...abilities.map((row) => `[${row[column]}]`));
  }
  return `#ability-grid(${cells.join(", ")})`;
}

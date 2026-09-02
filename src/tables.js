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
  if (header.join("|") === "STAT|SCORE|MOD|SAVE") {
    const abilities = rows.slice(1).filter((row) => row.length === 4);
    if (abilities.length !== 6) return null;
    return renderAbilityGrid(
      abilities.map((row) => row[0]),
      [
        { label: "SCORE", values: abilities.map((row) => row[1]) },
        { label: "MOD", values: abilities.map((row) => row[2]) },
        { label: "SAVE", values: abilities.map((row) => row[3]) },
      ],
    );
  }

  if (header.join("|") !== "STR|DEX|CON|INT|WIS|CHA" || rows.length !== 2 || rows[1].length !== 6) {
    return null;
  }
  const values = rows[1].map((cell) => cell.trim());
  const scoreAndModifier = values.map((cell) => /^(.+?)\s*\(([+-]\d+)\)$/.exec(cell));
  if (scoreAndModifier.every((match) => match !== null)) {
    return renderAbilityGrid(header, [
      { label: "SCORE", values: scoreAndModifier.map((match) => match?.[1] ?? "") },
      { label: "MOD", values: scoreAndModifier.map((match) => match?.[2] ?? "") },
    ]);
  }
  if (values.every((cell) => /^[+-]\d+$/.test(cell))) {
    return renderAbilityGrid(header, [{ label: "MOD", values }]);
  }
  return null;
}

/**
 * @param {string[]} abilities
 * @param {{ label: string, values: string[] }[]} metrics
 */
function renderAbilityGrid(abilities, metrics) {
  const cells = ["[]", ...abilities.map((ability) => `[${ability}]`)];
  for (const metric of metrics) {
    cells.push(`[${metric.label}]`, ...metric.values.map((value) => `[${value}]`));
  }
  return `#ability-grid(${cells.join(", ")})`;
}

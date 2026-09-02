/**
 * @param {string} source
 * @returns {Array<{ title: string, body: string }>}
 */
export function splitIndexCards(source) {
  const headings = [...source.matchAll(/^# (.+?)\r?$/gm)];
  return headings.map((heading, index) => {
    const bodyStart = (heading.index ?? 0) + heading[0].length;
    const bodyEnd = headings[index + 1]?.index ?? source.length;
    return {
      title: heading[1].trim(),
      body: source.slice(bodyStart, bodyEnd)
        .replace(/^\s*-\s*\*\*Source:\*\*.*(?:\r?\n)?/gim, "")
        .trim(),
    };
  });
}

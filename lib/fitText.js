// Simple text fitting utilities for captions in 9:16
export function splitIntoLines(text, maxCharsPerLine = 36, maxLines = 2) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + (current ? " " : "") + w).length <= maxCharsPerLine) {
      current = current ? current + " " + w : w;
    } else {
      lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (
    lines.length === maxLines &&
    words.slice(
      words.indexOf(current.split(" ")[0]) + current.split(" ").length
    ).length
  ) {
    // Truncate with ellipsis if overflow (rough check)
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\.*$/, "") + "…";
  }
  return lines;
}

export function clampChars(text, max = 180) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}


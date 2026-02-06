const collapseWhitespace = (value) => `${value || ""}`.replace(/\s+/g, " ").trim();

const toTitleCaseWord = (word) =>
  word
    .split("-")
    .map((part) =>
      part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""
    )
    .join("-");

export const normalizeRegionDisplay = (value) => {
  const normalized = collapseWhitespace(value);
  if (!normalized) return "";

  return normalized
    .split(" ")
    .filter(Boolean)
    .map(toTitleCaseWord)
    .join(" ");
};

export const toRegionKey = (value) =>
  collapseWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


// 🔥 Clean normal text
function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9@.+\s]/g, "")
    .toLowerCase();
}

// 🔥 Fix broken PDF text (VERY IMPORTANT)
function fixBrokenWords(text) {
  if (!text) return "";

  return text
    // Fix: R e a c t → React
    .replace(/\b([a-zA-Z])\s+(?=[a-zA-Z]\b)/g, "$1")

    // Remove extra spaces
    .replace(/\s+/g, " ");
}

module.exports = {
  cleanText,
  fixBrokenWords
};
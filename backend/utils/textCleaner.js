function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9@.+\s]/g, "")
    .toLowerCase();
}

// 🔥 Fix broken PDF text (R e a c t → React)
function fixBrokenWords(text) {
  return text.replace(/\b([a-zA-Z])\s+(?=[a-zA-Z]\b)/g, "$1");
}

module.exports = { cleanText, fixBrokenWords };
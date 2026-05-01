let fixedInput = input ?? "";

fixedInput = String(fixedInput)
  .replace(/\\n/g, "\n")   // convert \n to real newline
  .trim();

if (fixedInput.length === 0) {
  console.log("⚠️ EMPTY INPUT SENT TO CODE");
}

console.log("FINAL INPUT SENT:", fixedInput);

process.stdin.write(fixedInput + "\n");
process.stdin.end();
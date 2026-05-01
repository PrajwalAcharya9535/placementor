const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const runJavaCode = (code) => {
  return new Promise((resolve, reject) => {
    const dir = __dirname;
    const filePath = path.join(dir, "Main.java");

    // Write Java code
    fs.writeFileSync(filePath, code);

    // Compile + Run
    exec(`javac Main.java && java Main`, { cwd: dir }, (err, stdout, stderr) => {
      if (err) {
        return reject(stderr || err.message);
      }
      resolve(stdout.trim());
    });
  });
};

module.exports = runJavaCode;
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "node_modules/@x-viewer/core/dist/index.esm.js");

let content = fs.readFileSync(filePath, "utf8");

// Pattern with literal \x encoding (backslash, x, 2, 0)
const literalPattern1 =
  "\\x20\\x20\\x20\\x20\\x20\\x20\\x20#define\\x20saturate(a)\\x20clamp(a,\\x200.0,\\x201.0)";
const literalReplacement1 =
  "\\x20\\x20\\x20\\x20\\x20\\x20\\x20#ifndef\\x20saturate\\x0a#define\\x20saturate(a)\\x20clamp(\\x20a,\\x200.0,\\x201.0\\x20)\\x0a#endif";

const literalPattern2 = "\\x23define\\x20saturate(a)\\x20clamp(\\x20a,\\x200.0,\\x201.0\\x20)";
const literalReplacement2 =
  "#ifndef\\x20saturate\\x0a#define\\x20saturate(a)\\x20clamp(\\x20a,\\x200.0,\\x201.0\\x20)\\x0a#endif";

let patched = false;

if (content.includes(literalPattern1)) {
  content = content.replace(literalPattern1, literalReplacement1);
  patched = true;
  console.log("Fixed pattern 1 (8 leading spaces)");
}

if (content.includes(literalPattern2)) {
  content = content.replace(literalPattern2, literalReplacement2);
  patched = true;
  console.log("Fixed pattern 2 (#define with x23)");
}

if (patched) {
  fs.writeFileSync(filePath, content);
  console.log("Shader macro conflict fixed!");
} else {
  console.log("No patterns found");
  // Debug: find the actual saturate define patterns
  let idx = content.indexOf("saturate");
  let count = 0;
  while (idx > -1 && count < 10) {
    const ctx = content.substring(Math.max(0, idx - 30), idx + 60);
    if (ctx.includes("define") || ctx.includes("#define")) {
      console.log(
        `Found define saturate at ${idx}: ...${ctx.substring(ctx.indexOf("define") > -1 ? ctx.indexOf("define") - 10 : 0, ctx.indexOf("define") + 50)}...`,
      );
    }
    idx = content.indexOf("saturate", idx + 1);
    count++;
  }
}

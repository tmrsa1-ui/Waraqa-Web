#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const html = readFileSync(join(ROOT, "public", "index.html"), "utf8");
const licensed = readFileSync(join(ROOT, "docs", "licensed-negation.txt"), "utf8").trim();
const headers = readFileSync(join(ROOT, "public", "_headers"), "utf8");
let fail = 0;
function check(ok, msg) {
  if (ok) console.log(`✔ ${msg}`);
  else {
    fail++;
    console.error(`✘ ${msg}`);
  }
}

check(html.includes(licensed), "جملة النفي حرفًا بحرف");
check((html.match(/أ\/ب/g) ?? []).length === 1, "أ/ب مرة واحدة (عدّ مطابقات)");
check((html.match(/مفتاح الإجابة/g) ?? []).length === 1, "مفتاح الإجابة مرة واحدة");
check(!html.includes("waraqa-v1"), "بلا مفتاح تخزين waraqa-v1");
const htmlFiles = existsSync(join(ROOT, "public"))
  ? readdirSync(join(ROOT, "public")).filter((f) => f.endsWith(".html"))
  : [];
check(htmlFiles.length === 1 && htmlFiles[0] === "index.html", "ملف HTML حيّ واحد: public/index.html");
check(headers.includes("script-src") && headers.includes("'self'"), "script-src يحوي 'self'");
check(headers.includes("style-src") && headers.includes("'self'"), "style-src يحوي 'self'");
check(headers.includes("frame-ancestors 'none'"), "frame-ancestors 'none'");
check(/Strict-Transport-Security:\s*max-age=31536000/.test(headers), "HSTS");

if (fail) {
  console.error(`verify-web-face فشل — ${fail} خلل`);
  process.exit(1);
}
console.log("verify-web-face أخضر.");

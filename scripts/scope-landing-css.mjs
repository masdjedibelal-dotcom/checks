import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawPath = path.join(__dirname, "landing-raw.css");
const outPath = path.join(__dirname, "../app/flow-leads-landing.css");
const WRAP = ".flow-leads-landing";

const raw = fs.readFileSync(rawPath, "utf8");

function scopeSelectorPart(p) {
  const s = p.trim();
  if (!s) return s;
  if (s === "html") return s;
  if (s === ":root" || s === "body") return WRAP;
  if (s === "*" || s.startsWith("*::")) return `${WRAP} ${s}`;
  return `${WRAP} ${s}`;
}

/** Scope all top-level rules in a CSS block (no outer braces). */
function scopeBlock(css) {
  let out = "";
  let i = 0;
  const n = css.length;

  while (i < n) {
    while (i < n && /\s/.test(css[i])) {
      out += css[i];
      i++;
    }
    if (i >= n) break;

    if (css[i] === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      out += css.slice(i, end + 2);
      i = end + 2;
      continue;
    }

    if (css[i] === "@" && css.slice(i, i + 10) === "@keyframes") {
      let depth = 0;
      let j = i;
      for (; j < n; j++) {
        if (css[j] === "{") depth++;
        if (css[j] === "}") {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      out += css.slice(i, j);
      i = j;
      continue;
    }

    if (css[i] === "@" && css.slice(i, i + 6) === "@media") {
      let j = i;
      while (j < n && css[j] !== "{") j++;
      const head = css.slice(i, j + 1);
      let depth = 1;
      const innerStart = j + 1;
      j++;
      while (j < n && depth > 0) {
        if (css[j] === "{") depth++;
        if (css[j] === "}") depth--;
        j++;
      }
      const inner = css.slice(innerStart, j - 1);
      out += head.slice(0, -1) + "{" + scopeBlock(inner) + "}";
      i = j;
      continue;
    }

    let j = i;
    while (j < n && css[j] !== "{") j++;
    if (j >= n) {
      out += css.slice(i);
      break;
    }
    const sel = css.slice(i, j).trim();
    let depth = 0;
    let k = j;
    for (; k < n; k++) {
      if (css[k] === "{") depth++;
      if (css[k] === "}") {
        depth--;
        if (depth === 0) {
          k++;
          break;
        }
      }
    }
    const body = css.slice(j, k);
    i = k;

    if (!sel) continue;
    const scopedSel = sel
      .split(",")
      .map(scopeSelectorPart)
      .join(", ");
    out += scopedSel + body;
  }
  return out;
}

const header = `html {
  scroll-behavior: smooth;
}

${WRAP} {
  --ink: #1a1a1a;
  --dark: #0f1a14;
  --gold: #b8884a;
  --gold-light: #f5ede0;
  --gold-mid: #e8d0b0;
  --bg: #f0ede6;
  --surface: #faf9f6;
  --border: rgba(0, 0, 0, 0.08);
  --border-mid: rgba(0, 0, 0, 0.12);
  --mid: rgba(0, 0, 0, 0.45);
  --muted: rgba(0, 0, 0, 0.28);
  --white: #ffffff;
  font-family: "DM Sans", system-ui, sans-serif;
  background: #f0ede6;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  min-height: 100vh;
}

${WRAP},
${WRAP} *,
${WRAP} *::before,
${WRAP} *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

${WRAP} a {
  text-decoration: none;
  color: inherit;
}

${WRAP} button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

${WRAP} img {
  display: block;
  max-width: 100%;
}

`;

fs.writeFileSync(outPath, header + scopeBlock(raw.trim()) + "\n");
console.log("Wrote", outPath);

#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const checksDir = path.join(__dirname, "../components/checks");

const SLIDER_START = 'function SliderField({label,value,min,max,step,onChange,display,hint,unit=""})';

/** Historisches One-Off-Migrationsskript — Ziel-`.tsx`-Dateien wurden konsolidiert/gelöscht. */
const JOBS = [];

function extractConstTBlock(src) {
  const needle = "const T=";
  const idx = src.indexOf(needle);
  if (idx === -1) return null;
  let i = idx + needle.length;
  while (i < src.length && src[i] !== "{") i++;
  let depth = 1;
  i++;
  while (i < src.length && depth > 0) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") depth--;
    i++;
  }
  const semi = src[i] === ";" ? 1 : 0;
  return { before: src.slice(0, idx), after: src.slice(i + semi) };
}

function stripIifeMaklerC(text) {
  let t = text.replace(/\r\n/g, "\n");
  t = t.replace(
    /\n\(\(\) => \{ if \(typeof document === "undefined"\) return;[\s\S]*?\}\)\(\);\s*\n/,
    "\n"
  );
  t = t.replace(/\nconst MAKLER=\{[^}]+\};\s*\n/, "\n");
  const subs = [
    [/\nconst C=MAKLER\.primaryColor,WARN="#c0392b",OK="#059669";\s*\n/, '\nconst WARN = "#c0392b";\nconst OK = "#059669";\n'],
    [/\nconst C=MAKLER\.primaryColor,WARN="#c0392b";\s*\n/, '\nconst WARN = "#c0392b";\n'],
    [/\nconst C=MAKLER\.primaryColor,OK="#059669";\s*\n/, '\nconst OK = "#059669";\n'],
    [/\nconst C=MAKLER\.primaryColor;\s*\n/, "\n"],
  ];
  for (const [re, rep] of subs) {
    if (re.test(t)) return t.replace(re, rep);
  }
  return t;
}

function buildImports(kind) {
  const shared = `import { useMemo, useState } from "react";
import { useMakler } from "@/components/ui/MaklerContext";
import { standardCheckT } from "./checkStandardT";
`;
  if (kind === "simple") return shared;
  if (kind === "slider") {
    return `${shared}import CheckRangeField from "./CheckRangeField";
`;
  }
  return `${shared}import CheckRangeField from "./CheckRangeField";
import CheckKitDanke from "./CheckKitDanke";
import CheckKitKontaktForm from "./CheckKitKontaktForm";
`;
}

function patchImports(text, kind) {
  let t = text.replace('"use client";', "'use client';");
  t = t.replace(/import \{ useState \} from "react";\s*\n/, buildImports(kind));
  return t;
}

function injectHooks(text, fnName) {
  const re = new RegExp(`export default function ${fnName}\\(\\)\\{`);
  const hook = `export default function ${fnName}(){
  const MAKLER = useMakler();
  const C = MAKLER.primaryColor;
  const T = useMemo(() => standardCheckT(C), [C]);
`;
  return text.replace(re, hook);
}

function replaceTripleUsage(text) {
  let t = text.replace(/<SliderField/g, "<CheckRangeField C={C} T={T}");
  t = t.replace(/<Danke\s/g, "<CheckKitDanke makler={MAKLER} accent={C} ");
  t = t.replace(/<KontaktForm\s/g, "<CheckKitKontaktForm T={T} ");
  return t;
}

function replaceSliderOnly(text) {
  return text.replace(/<SliderField/g, "<CheckRangeField C={C} T={T}");
}

for (const [srcName, destName, fnName, kind] of JOBS) {
  const src = path.join(checksDir, srcName);
  let text = fs.readFileSync(src, "utf8");

  text = patchImports(text, kind);
  text = stripIifeMaklerC(text);

  const ex = extractConstTBlock(text);
  if (!ex) throw new Error(`const T= missing in ${srcName}`);
  text = ex.before + ex.after;

  if (kind === "triple") {
    const i = text.indexOf(SLIDER_START);
    const j = text.indexOf("function berechne(p)");
    if (i === -1 || j === -1 || j <= i) throw new Error(`triple slice failed ${srcName}`);
    text = text.slice(0, i) + text.slice(j);
    text = replaceTripleUsage(text);
  } else if (kind === "slider") {
    const i = text.indexOf(SLIDER_START);
    const j = text.indexOf("export default function");
    if (i === -1 || j === -1 || j <= i) throw new Error(`slider slice failed ${srcName}`);
    text = text.slice(0, i) + text.slice(j);
    text = replaceSliderOnly(text);
  }

  text = injectHooks(text, fnName);

  const dest = path.join(checksDir, destName);
  fs.writeFileSync(dest, text, "utf8");
  console.log("OK", destName);
}

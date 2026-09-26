//Completely LLM generated: Claude Sonnet 5
import { XMLParser } from "fast-xml-parser";
import fs from "node:fs";
import path from "node:path";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  preserveOrder: false,
  allowBooleanAttributes: true,
});

const elementCounts = new Map<string, number>();
const attributeValues = new Map<string, Set<string>>();
const titleKeyExamples: string[] = [];

function walk(node: any, tagPath: string) {
  if (node == null || typeof node !== "object") return;

  for (const key of Object.keys(node)) {
    if (key.startsWith("@_")) continue;
    const childTag = `${tagPath}/${key}`;
    const children = Array.isArray(node[key]) ? node[key] : [node[key]];

    elementCounts.set(
      childTag,
      (elementCounts.get(childTag) ?? 0) + children.length,
    );

    for (const child of children) {
      if (child && typeof child === "object") {
        for (const attr of Object.keys(child)) {
          if (attr.startsWith("@_")) {
            const attrKey = `${childTag}@${attr.slice(2)}`;
            if (!attributeValues.has(attrKey))
              attributeValues.set(attrKey, new Set());
            const set = attributeValues.get(attrKey)!;
            if (set.size < 20) set.add(String(child[attr]));
          }
        }
        walk(child, childTag);
      }
    }
  }
}

const dir = process.argv[2];
if (typeof dir == "string") {
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".xml"))) {
    const xml = fs.readFileSync(path.join(dir, file), "utf-8");

    const doc = parser.parse(xml);

    walk(doc, file);
    const matches = xml.match(/<title key="([^"]*)">/g) ?? [];

    titleKeyExamples.push(...matches.slice(0, 5));
  }

  console.log("=== Element frequency ===");
  console.log([...elementCounts.entries()].sort((a, b) => b[1] - a[1]));

  for (const [k, v] of attributeValues) console.log(k, "->", [...v]);

  console.log("\n=== Attribute key samples ===");
  console.log(titleKeyExamples.slice(0, 30));
}

import { XMLParser } from "fast-xml-parser";
import fs from "node:fs";
import path from "node:path";

import { parseTitleKey, type ParsedTitleKey } from "./titleKeyParser.ts";

interface teiData {
  tei_id: string;
  parsedTitleKey: ParsedTitleKey;
}

interface teiCollectionData {
  xmlId: string;
  teiCollectionData: teiData[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

//console.log("Collection_id:", collection["@_xml:id"]);
let nTeis = 0;
let nParseOk = 0;
let problemTeiList: string[] = [];

const dir = process.argv[2];
if (typeof dir == "string") {
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".xml"))) {
    const xml = fs.readFileSync(path.join(dir, file), "utf-8");

    const doc = parser.parse(xml);
    const collection = doc.teiCollection;

    const teiCollectionData: teiCollectionData = {
      xmlId: collection["@_xml:id"],
      teiCollectionData: [],
    };

    const teiEntries = Array.isArray(collection.TEI)
      ? collection.TEI
      : [collection.TEI];

    for (const tei of teiEntries) {
      const titleStmt = tei?.teiHeader?.fileDesc?.titleStmt;
      const teiXmlId = tei["@_xml:id"];
      const parsedTitleKey: ParsedTitleKey = parseTitleKey(
        titleStmt?.title?.["@_key"],
      );

      nTeis += 1;
      if (parsedTitleKey.parseOk) {
        nParseOk += 1;
      } else {
        problemTeiList.push(teiXmlId);
      }
      /*
    console.log(
      "tei_id:",
      teiXmlId ?? null,
      "Q-line:",
      titleStmt?.title?.["@_key"],
    );
      */
      if (teiXmlId === "DODSLEY_061") {
        console.log(parsedTitleKey);
      }

      teiCollectionData.teiCollectionData.push({
        tei_id: teiXmlId,
        parsedTitleKey,
      });
    }
  }
}

console.log(`${nParseOk}/${nTeis} OK.`);
console.log("Problem files:");
console.log(problemTeiList.slice(0, 5));

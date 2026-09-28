// Mostly LLM generated: Claude Sonet 5
import { Client } from "pg";
import { XMLParser } from "fast-xml-parser";
import fs from "node:fs";
import { parseTitleKey } from "./titleKeyParser.ts";

const client = new Client({
  connectionString: "postgres://corpus:corpus@localhost:5432/corpus_dev",
});

async function main() {
  await client.connect();
  console.log("Connected to database");
  if (typeof process.argv[2] == "string") {
    const xml = fs.readFileSync(process.argv[2], "utf-8");
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const doc = parser.parse(xml);

    const collection = doc.teiCollection;
    const collectionRes = await client.query(
      `INSERT INTO collections (xml_id, title_stmt) VALUES ($1, $2) ON CONFLICT (xml_id) DO UPDATE SET xml_id = EXCLUDED.xml_id RETURNING id`,
      [collection["@_xml:id"], collection["@_titleStmt"]],
    );
    const collectionId = collectionRes.rows[0].id;

    const teiEntries = Array.isArray(collection.TEI)
      ? collection.TEI
      : [collection.TEI];
    for (const tei of teiEntries) {
      const titleStmt = tei?.teiHeader?.fileDesc?.titleStmt;

      const titleKeyRaw = titleStmt?.title?.["@_key"] ?? null;
      const parsed = parseTitleKey(titleKeyRaw);

      if (!parsed.parseOk)
        console.warn(
          `Could not parse Q-line for ${tei["@_xml:id"]}: ${titleKeyRaw}`,
        );

      await client.query(
        `INSERT INTO documents (collection_id, xml_id, title_key, author_key, text_type, lang, raw_xml, authenticity, year, year_raw, year_is_decade_suggestion, year_is_uncertain,
     relationship_code, correspondent_code, title_key_parse_ok)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          collectionId,
          tei["@_xml:id"] ?? null,
          titleStmt?.title?.["@_key"] ?? null,
          titleStmt?.author?.["@_key"] ?? null,
          tei?.text?.["@_type"] ?? null,
          tei?.text?.["@_xml:lang"] ?? null,
          `<TEI>${JSON.stringify(tei)}</TEI>`, // TODO: placeholder — text includes !ENTITY tags for special charachters
          parsed.authenticity,
          parsed.year,
          parsed.yearRaw,
          parsed.yearIsDecadeSuggestion,
          parsed.yearIsUncertain,
          parsed.relationshipCode,
          parsed.correspondentCode,
          parsed.parseOk,
        ],
      );
    }
  }
  await client.end();
}
main().catch((e) => {
  console.error("import failed:", e);
  process.exit(1);
});

// Mostly LLM generated: Claude Sonet 5
import { Client } from "pg";
import { XMLParser } from "fast-xml-parser";
import fs from "node:fs";

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
      await client.query(
        `INSERT INTO documents (collection_id, xml_id, title_key, author_key, text_type, lang, raw_xml)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          collectionId,
          tei["@_xml:id"] ?? null,
          titleStmt?.title?.["@_key"] ?? null,
          titleStmt?.author?.["@_key"] ?? null,
          tei?.text?.["@_type"] ?? null,
          tei?.text?.["@_xml:lang"] ?? null,
          `<TEI>${JSON.stringify(tei)}</TEI>`, // placeholder — see note below
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

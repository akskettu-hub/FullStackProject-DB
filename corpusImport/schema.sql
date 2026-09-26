-- Mostly LLM generated: Claude Sonet 5

CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    xml_id TEXT UNIQUE NOT NULL,
    title_stmt TEXT
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    collection_id INT REFERENCES collections(id),
    xml_id TEXT,
    title_key TEXT,
    author_key TEXT,
    text_type TEXT,
    lang TEXT,
    raw_xml TEXT NOT NULL,
    parsed_fields JSONB DEFAULT '{}'
);

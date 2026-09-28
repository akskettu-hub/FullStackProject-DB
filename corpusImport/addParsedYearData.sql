ALTER TABLE documents
  ADD COLUMN authenticity TEXT,
  ADD COLUMN year INT,
  ADD COLUMN year_raw TEXT,
  ADD COLUMN year_is_decade_suggestion BOOLEAN DEFAULT FALSE,
  ADD COLUMN year_is_uncertain BOOLEAN DEFAULT FALSE,
  ADD COLUMN relationship_code TEXT,
  ADD COLUMN correspondent_code TEXT,
  ADD COLUMN title_key_parse_ok BOOLEAN DEFAULT FALSE;

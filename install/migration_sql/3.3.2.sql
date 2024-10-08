ALTER TABLE accounts_supplier ADD CONSTRAINT duns_unique UNIQUE (duns);
ALTER TABLE splitter_batches ADD COLUMN subject VARCHAR(255);
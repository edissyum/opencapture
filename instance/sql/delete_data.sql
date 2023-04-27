-- Delete all data of Open-Capture application before production

TRUNCATE TABLE history;
ALTER SEQUENCE history_id_seq RESTART WITH 1;

TRUNCATE TABLE documents;
ALTER SEQUENCE documents_id_seq RESTART WITH 1;

TRUNCATE TABLE splitter_batches;
ALTER SEQUENCE splitter_batches_id_seq RESTART WITH 1;

TRUNCATE TABLE splitter_documents;
ALTER SEQUENCE splitter_documents_id_seq RESTART WITH 1;

TRUNCATE TABLE splitter_pages;
ALTER SEQUENCE splitter_pages_id_seq RESTART WITH 1;

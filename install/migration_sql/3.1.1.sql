ALTER TABLE history ADD COLUMN "workflow_id" VARCHAR(255);

UPDATE docservers SET docserver_id = 'VERIFIER_ORIGINAL_DOC' WHERE docserver_id = 'VERIFIER_ORIGINAL_PDF';
UPDATE docservers SET path = REPLACE(path, 'original_pdf', 'original_doc') WHERE docserver_id = 'VERIFIER_ORIGINAL_DOC';
UPDATE docservers SET description = '[VERIFIER] Chemin vers le dossier contenant les documents originaux' WHERE docserver_id = 'VERIFIER_ORIGINAL_DOC';

UPDATE docservers SET docserver_id = 'SPLITTER_ORIGINAL_DOC' WHERE docserver_id = 'SPLITTER_ORIGINAL_PDF';
UPDATE docservers SET path = REPLACE(path, 'original_pdf', 'original_doc') WHERE docserver_id = 'SPLITTER_ORIGINAL_DOC';
UPDATE docservers SET description = '[SPLITTER] Chemin vers le dossier contenant les documents originaux' WHERE docserver_id = 'SPLITTER_ORIGINAL_DOC';

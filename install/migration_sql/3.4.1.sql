INSERT INTO "configurations" ("label", "data") VALUES ('enableAttachments', '{"type": "bool", "value": false, "description": "Activer l''affichage des pièces jointes dans les module Verifier et Splitter"}');

INSERT INTO "privileges" ("label", "parent") VALUES ('attachments_list_splitter', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('attachments_list_verifier', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('upload_attachments_verifier', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('upload_attachments_splitter', 'splitter');

ALTER TABLE "mailcollect" ADD COLUMN IF NOT EXISTS verifier_insert_body_as_doc BOOLEAN DEFAULT FALSE;
ALTER TABLE "mailcollect" ADD COLUMN IF NOT EXISTS splitter_insert_body_as_doc BOOLEAN DEFAULT FALSE;
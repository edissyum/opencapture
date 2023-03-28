ALTER TABLE form_models ADD COLUMN "labels" JSONB DEFAULT '{}';

INSERT INTO "privileges" ("label", "parent") VALUES ('update_status', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_status', 'verifier');

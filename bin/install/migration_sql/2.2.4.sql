-- Add the feature to select specific language for a supplier
ALTER TABLE "accounts_supplier" ADD COLUMN "document_lang" VARCHAR(10) DEFAULT 'fra';

-- Improve supplier detection using email adress
ALTER TABLE "accounts_supplier" ADD COLUMN "email" VARCHAR UNIQUE;
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('emailRegex', 'fra', 'Adresse email', '([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.(fr|com|org|eu))+');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('emailRegex', 'eng', 'Adresse email', '([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.(fr|com|org|eu))+');

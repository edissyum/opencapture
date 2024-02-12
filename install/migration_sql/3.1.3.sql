ALTER TABLE accounts_supplier ADD COLUMN rccm VARCHAR(30);

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('rccm', 'global', 'Numéro RCCM', '[aA-zZ]{2}-[aA-zZ]{3}-[0-9]{2}-[0-9]{4}-[aA-zZ]{1}[0-9]{2}-[0-9]{5}');

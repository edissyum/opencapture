ALTER TABLE "splitter_batches" ADD COLUMN subject VARCHAR(255);
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('currency', 'global', 'Devise', '((R\$|EUR|USD|CAD|AUD|A\$|CNY|CHF)|[£$€¥])\s*(\d+(?:[\.|,]\d{2})?)|(\d+(?:[\.|,]\d{2})?)\s*((R\$|EUR|USD|CAD|AUD|A\$|CNY|CHF)|[£$€¥])');

ALTER TABLE accounts_supplier ADD COLUMN "default_currency" VARCHAR(10);
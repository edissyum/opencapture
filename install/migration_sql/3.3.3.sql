ALTER TABLE "splitter_batches" ADD COLUMN subject VARCHAR(255);
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('currency', 'global', 'Devise', '((R\$|EUR|USD|CAD|AUD|A\$|CNY|CHF)|[£$€¥])\s*(\d+(?:[\.|,]\d{2})?)|(\d+(?:[\.|,]\d{2})?)\s*((R\$|EUR|USD|CAD|AUD|A\$|CNY|CHF)|[£$€¥])|((CURRENCY|TOTAL)\s*[,.:;(]?\s*(R\$|EUR|USD|CAD|AUD|A\$|CNY|CHF)[)]?)');

UPDATE "regex" SET content = '([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9})\s*(3[01]|[12][0-9]|0?[1-9][\.,-]?)[\.,-]?\s*((1|2|3){1}\d{1,3}|(1|2|3))|(((1[0-2]|0?[1-9])|\d{1}\w{2})\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[\/,-\.](3[01]|[12][0-9]|0?[1-9])[\/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3)))' WHERE regex_id = 'date' AND lang = 'eng';

ALTER TABLE accounts_supplier ADD COLUMN "default_currency" VARCHAR(10);
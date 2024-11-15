ALTER TABLE "splitter_batches" ADD COLUMN subject VARCHAR(255);
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('currency', 'global', 'Devise', '((R\$|EUR|USD|CAD|AUD|A\$|CNY|CHF)|[£$€¥])\s*(\d+(?:[\.|,]\d{2})?)|(\d+(?:[\.|,]\d{2})?)\s*((R\$|EUR|USD|CAD|AUD|A\$|CNY|CHF)|[£$€¥])|((CURRENCY|TOTAL)\s*[,.:;(]?\s*(R\$|EUR|USD|CAD|AUD|A\$|CNY|CHF)[)]?)');

UPDATE "regex" SET content = '((DATE(:)?)?\s*(\d{4}[\.,-\/](3[01]|[12][0-9]|0?[1-9])[\.,-\/](3[01]|[12][0-9]|0?[1-9]))|([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9})\s*(3[01]|[12][0-9]|0?[1-9][\.,-]?)[\.,-]?\s*((1|2|3){1}\d{1,3}|(1|2|3))|(((3[01]|[12][0-9]|0?[1-9])[\.,-]?)\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[\/,-\.](3[01]|[12][0-9]|0?[1-9])[\/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3))))' WHERE regex_id = 'date' AND lang = 'eng';

UPDATE "regex" SET content = '(INVOICE\s*(NUMBER|#|NO|N(°)?)\s*(\.)?\s*(:)?).*' WHERE regex_id = 'invoice_number' AND lang = 'eng';
UPDATE "regex" SET content = '(DELIVERY\s*(NOTE)?\s*(NUMBER|#|NO|N(°)?)\s*(\.)?\s*(:)?).*' WHERE regex_id = 'delivery_number' AND lang = 'eng';
UPDATE "regex" SET content = '(((QUOT(E|ATION)|ORDER|PURCHASE\s*ORDER|P(/)?O)\s*(NUMBER|#|NO|N(°)?)|(SALES)\s*(ORDER)\s*(NUMBER|#|NO|N(°)?))\s*(\.)?\s*(:)?).*' WHERE regex_id = 'quotation_number' AND lang = 'eng';
UPDATE "regex" SET content = '(TOTAL|GROSS)\s*(AMOUNT|DUE)(\s*PAID)?\s*(:)?\s*(\$|£|€|EUROS|EUR|CAD|USD)?\s*.*' WHERE regex_id = 'all_rates' AND lang = 'eng';
UPDATE "regex" SET content = '(NET)\s*(AMOUNT|DUE)(\s*PAID)?\s*(:)?\s*(\$|£|€|EUROS|EUR|CAD|USD)?\s*.*' WHERE regex_id = 'no_rates' AND lang = 'eng';
UPDATE "regex" SET content = '(VAT\s*(NUMBER|AMOUNT\s*)|TOTAL\s*TAXES)(\$|£|€|EUROS|EUR|CAD|USD)?\s*.*' WHERE regex_id = 'vat_amount' AND lang = 'eng';

UPDATE "regex" SET content = '((DATE)?\s*(D(''|\s*))?(E|É)CH(É|E)ANCE(\(S\))?\s*:?\s*?\s*(AU)?\s*|FACTURE\s*(A|À)\s*PAYER\s*AVANT\s*LE\s*(:)?\s*)' WHERE regex_id = 'due_date' AND lang = 'fra';
    
ALTER TABLE accounts_supplier ADD COLUMN "default_currency" VARCHAR(10);
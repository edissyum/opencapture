-- Add login message
INSERT INTO "configurations" ("label", "data") VALUES ('loginMessage', '{"type": "string", "value": "Open-Capture For Invoices - LAD / RAD", "description": "Court message affiché sur l''écran d''accueil"}');

-- Add minimum quotation number size
INSERT INTO "configurations" ("label", "data") VALUES ('devisSizeMin', '{"type": "int", "value": "3", "description": "Taille minimale pour un numéro de devis"}');

-- Improve REGEX
UPDATE regex SET content = '(((?P<r1>NUMERO|N(O|°|º|R.))?\s*(DE)?\s*(DEVIS)(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?|(R(E|É)F(\.)?\s*PROPOSITION\s*COMMERCIALE)|CONTRAT\s*(N(O|°|º|R.)))\s*(:|#){0,1}).*' WHERE lang = 'fra' AND regex_id = 'quotationRegex';

-- Move languages to database instead of lang.json file
CREATE TABLE "languages"
(
    "language_id"       VARCHAR(5) UNIQUE PRIMARY KEY,
    "label"             VARCHAR(20),
    "lang_code"         VARCHAR(5),
    "moment_lang_code"  VARCHAR(10),
    "date_format"       VARCHAR(20)
);
INSERT INTO "languages" ("language_id", "label", "lang_code", "moment_lang_code", "date_format") VALUES ('fr','Francais', 'fra', 'fr-FR', '%d %m %Y');
INSERT INTO "languages" ("language_id", "label", "lang_code", "moment_lang_code", "date_format") VALUES ('en', 'English', 'eng', 'en-GB', '%m %d %Y');

-- Move allow automatic validation from inputs to form settings
ALTER TABLE inputs DROP COLUMN "allow_automatic_validation";
ALTER TABLE inputs DROP COLUMN "automatic_validation_data";

ALTER TABLE form_models ADD COLUMN "allow_automatic_validation" BOOLEAN DEFAULT False;
ALTER TABLE form_models ADD COLUMN "automatic_validation_data" TEXT DEFAULT '';
ALTER TABLE form_models ADD COLUMN delete_documents_after_outputs BOOLEAN DEFAULT False;

-- Remove useless docservers
DELETE FROM docservers WHERE "docserver_id" = 'VERIFIER_THUMB';

-- Improve verifier list display
INSERT INTO "privileges" ("label", "parent") VALUES ('verifier_display', 'verifier');
ALTER TABLE form_models ADD COLUMN "display" JSONB DEFAULT '{
    "subtitles": [
        {"id": "invoice_number", "label": "FACTURATION.invoice_number"},
        {"id": "invoice_date", "label": "FACTURATION.invoice_date"},
        {"id": "date", "label": "VERIFIER.register_date"},
        {"id": "original_filename", "label": "VERIFIER.original_file"},
        {"id": "form_label", "label": "VERIFIER.form"}
    ]
}';

-- Update REGEX
UPDATE "regex" SET "regex_id" = 'email'             WHERE "regex_id" = 'emailRegex';
UPDATE "regex" SET "regex_id" = 'siret'             WHERE "regex_id" = 'SIRETRegex';
UPDATE "regex" SET "regex_id" = 'siren'             WHERE "regex_id" = 'SIRENRegex';
UPDATE "regex" SET "regex_id" = 'iban'              WHERE "regex_id" = 'IBANRegex';
UPDATE "regex" SET "regex_id" = 'date'              WHERE "regex_id" = 'dateRegex';
UPDATE "regex" SET "regex_id" = 'due_date'          WHERE "regex_id" = 'dueDateRegex';
UPDATE "regex" SET "regex_id" = 'invoice_number'    WHERE "regex_id" = 'invoiceRegex';
UPDATE "regex" SET "regex_id" = 'delivery_number'   WHERE "regex_id" = 'deliveryNumberRegex';
UPDATE "regex" SET "regex_id" = 'quotation_number'  WHERE "regex_id" = 'quotationRegex';
UPDATE "regex" SET "regex_id" = 'no_rates'          WHERE "regex_id" = 'noRatesRegex';
UPDATE "regex" SET "regex_id" = 'all_rates'         WHERE "regex_id" = 'allRatesRegex';
UPDATE "regex" SET "regex_id" = 'vat_rate'          WHERE "regex_id" = 'vatRateRegex';
UPDATE "regex" SET "regex_id" = 'vat_amount'        WHERE "regex_id" = 'vatAmountRegex';
UPDATE "regex" SET "regex_id" = 'vat_rate_list'     WHERE "regex_id" = 'vatRateList';
UPDATE "regex" SET "regex_id" = 'format_date'       WHERE "regex_id" = 'formatDate';

-- Remove ORDER number
DELETE FROM "regex" WHERE "regex_id" = 'orderNumberRegex';
UPDATE "regex" SET "content" = '(((?P<r1>(NUM(E|É)RO|N(O|°|º|R.)?|R(E|É)F(\.)?((E|É)RENCE)?))?\s*(DE)?\s*(DEVIS|COMMANDE|C(M)?DE|DOCUMENT)\s*(INTERNET|EXTERNE|WEB)?(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?|(R(E|É)F(\.)?\s*PROPOSITION\s*COMMERCIALE)|(CONTRAT|COMMANDE|C(M)?DE)\s*(NUMERO|N(O|°|º|R.)))\s*(:|#){0,1}).*' WHERE regex_id = 'quotation_number' AND lang = 'fra';
UPDATE "regex" SET "content" = '((QUOT(E|ATION)|ORDER)\s*NUMBER\s*(:)?).*' WHERE regex_id = 'quotation_number' AND lang = 'fra';
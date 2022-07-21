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

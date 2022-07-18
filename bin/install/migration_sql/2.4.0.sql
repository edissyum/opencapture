-- Add Login message
INSERT INTO "configurations" ("label", "data") VALUES ('loginMessage', '{"type": "string", "value": "Open-Capture For Invoices - LAD / RAD", "description": "Court message affiché sur l''écran d''accueil"}');

-- Improve REGEX
UPDATE regex SET content = '(((?P<r1>NUMERO|N(O|°|º|R.))?\s*(DE)?\s*(DEVIS)(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?|(R(E|É)F(\.)?\s*PROPOSITION\s*COMMERCIALE)|CONTRAT\s*(N(O|°|º|R.)))\s*(:|#){0,1}).*' WHERE lang = 'fra' AND regex_id = 'quotationRegex';
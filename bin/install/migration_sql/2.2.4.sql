-- Add the feature to select specific language for a supplier
ALTER TABLE "accounts_supplier" ADD COLUMN "document_lang" VARCHAR(10) DEFAULT 'fra';

-- Improve supplier detection using email adress
ALTER TABLE "accounts_supplier" ADD COLUMN "email" VARCHAR;
DELETE from "regex" WHERE regex_id = 'emailRegex';
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('emailRegex', 'global', 'Adresse email', '([A-Za-z0-9]+[.\-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.(fr|com|org|eu|law))+');

-- Improve REGEX
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('quotationRegex', 'fra', 'Numéro de devis', '(((?P<r1>NUMERO|N(O|°|º|R.))?\s*(DE)?\s*(DEVIS)(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?)\s*(:|#){0,1}).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('quotationRegex', 'eng', 'Quotation number', '(QUOT(E|ATION)\s*NUMBER\s*(:)?).*');
UPDATE "regex" SET "content" = '([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9})\s*(3[01]|[12][0-9]|0?[1-9][\.,-]?)\s*((1|2|3){1}\d{1,3}|(1|2|3))| (((1[0-2]|0?[1-9])|\d{1}\w{2})\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[\/,-\.](3[01]|[12][0-9]|0?[1-9])[\/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3)))' WHERE lang = 'eng' AND "regex_id" = 'dateRegex';
UPDATE "regex" SET "content" = '(?P<r1>TOTAL|^(TOTAL)?\s*AMOUNT(\s*PAID)?)?\s*(:\s*)?(\$|£|€|EUROS|EUR|USD)?\s*(?(r1)()|(T(.)?T(.)?C|\(VAT\s*INCLUDE(D)?\))){1}\s*(:|(\$|£|€|EUROS|EUR|USD))?\s*([0-9]*(\.?\,?\|?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(\$|£|€|EUROS|EUR|USD)?' WHERE lang = 'eng' AND "regex_id" = 'allRatesRegex';
UPDATE "regex" SET "content" = '(?P<r1>MONTANT|^\s*TOTAL)?\s*(:\s*)?(€|EUROS|EUR)?\s*(?(r1)()|(T(.)?T(.)?C|\(TVA COMPRISE\)|TVAC|TVA\s*INCLUSE|NET\s*(À|A)\s*PAYER)){1}(\s*(À|A)\s*PAYER)?\s*(:|(€|EUROS|EUR))?\s*([0-9]*(\.?\,?\|?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR)?' WHERE lang = 'fra' AND "regex_id" = 'allRatesRegex';
UPDATE "regex" SET "content" = '%m/%d/%Y' WHERE lang = 'eng' AND "regex_id" = 'formatDate';
UPDATE "regex" SET "content" = '(INVOICE\s*NUMBER\s*(:)?).*' WHERE lang = 'eng' AND "regex_id" = 'invoiceRegex';
UPDATE "regex" SET "content" = '[20, 5, 0]' WHERE lang = 'eng' AND "regex_id" = 'vatRateList';
UPDATE "regex" SET "content" = '(VAT\s*(AMOUNT\s*)?)(\$|£|€|EUROS|EUR|USD)?\s*.*' WHERE lang = 'eng' AND "regex_id" = 'vatAmountRegex';
UPDATE "regex" SET "content" = '(20|5)%\s*(VAT)?' WHERE lang = 'eng' AND "regex_id" = 'vatRateRegex';
UPDATE "regex" SET "content" = '(ORDER\s*NUMBER\s*(:)?).*?' WHERE lang = 'eng' AND "regex_id" = 'orderNumberRegex';
UPDATE "regex" SET "content" = '(DELIVERY\s*NUMBER\s*(:)?).*' WHERE lang = 'eng' AND "regex_id" = 'deliveryNumberRegex';

DELETE from "regex" WHERE regex_id = 'IBANRegex';
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('IBANRegex', 'global', 'Numéro d''IBAN', '[A-Z]{2}(?:[ ]?[0-9]){18,25}');
DELETE from "regex" WHERE regex_id = 'VATNumberRegex';
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('VATNumberRegex', 'global', 'Numéro de TVA', '(EU[0-9]{7,9}|ATU[0-9]{8}|BE[01][0-9]{9}|BG[0-9]{9,10}|HR[0-9]{11}|CY[A-Z0-9]{9}|CZ[0-9]{8,10}|DK[0-9]{8}|EE[0-9]{9}|FI[0-9]{8}|FR[0-9A-Z]{2}[0-9]{9}|DE[0-9]{9}|EL[0-9]{9}|HU[0-9]{8}|IE([0-9]{7}[A-Z]{1,2}|[0-9][A-Z][0-9]{5}[A-Z])|IT[0-9]{11}|LV[0-9]{11}|LT([0-9]{9}|[0-9]{12})|LU[0-9]{8}|MT[0-9]{8}|NL[0-9]{9}B[0-9]{2}|PL[0-9]{10}|PT[0-9]{9}|RO[0-9]{2,10}|SK[0-9]{10}|SI[0-9]{8}|ES[A-Z]([0-9]{8}|[0-9]{7}[A-Z])|SE[0-9]{12}|GB([0-9]{9}|[0-9]{12}|GD[0-4][0-9]{2}|HA[5-9][0-9]{2}))');

-- Improve export_maarch output in verifier
UPDATE outputs_types SET "data" = '{
    "options": {
        "auth": [
            {
                "id": "host",
                "type": "text",
                "label": "URL de l''''hôte",
                "required": "true",
                "placeholder": "http://localhost/maarch_courrier/rest/"
            },
            {
                "id": "login",
                "type": "text",
                "label": "Pseudo de l''''utilisateur WS",
                "required": "true",
                "placeholder": "edissyumws"
            },
            {
                "id": "password",
                "type": "password",
                "label": "Mot de passe de l''''utilisateur WS",
                "required": "true",
                "placeholder": "maarch"
            }
        ],
        "links": [
            {
                "id": "enabled",
                "type": "boolean",
                "label": "Activer la liaison avec un document dans Maarch",
                "required": "true",
                "webservice": "",
                "placeholder": ""
            },
            {
                "id": "maarchCustomField",
                "type": "text",
                "label": "Champ personnalisé à récupérer",
                "required": "false",
                "webservice": "getCustomFieldsFromMaarch",
                "placeholder": "Numéro de devis",
                "hint": "Champ personnalisé Maarch dans lequel est stocké la donnée nécessaire à la liaison avec un document"
            },
            {
                "id": "openCaptureField",
                "type": "text",
                "label": "Champ à comparer dans Open-Capture",
                "required": "false",
                "webservice": "",
                "placeholder": "quotation_number",
                "hint": "Identifiant du champ dans Open-Capture"
            },
            {
                "id": "maarchClause",
                "type": "text",
                "label": "Clause de selection des documents dans Maarch",
                "required": "false",
                "webservice": "",
                "placeholder": "status <> ''END''",
                "hint": ""
            },
            {
                "id": "vatNumberContactCustom",
                "type": "text",
                "label": "Identifiant du champ personnalisé de contact où stocker le numéro de TVA + SIRET",
                "required": "true",
                "webservice": "getContactsCustomFieldsFromMaarch",
                "placeholder": "Identifiant Open-Capture",
                "hint": "Identifiant du champ personnalisé de contact où stocker le numéro de TVA + SIRET"
            }
        ],
        "parameters": [
            {
                "id": "destUser",
                "type": "text",
                "label": "Utilisateur destinataire",
                "required": "true",
                "webservice": "getUsersFromMaarch",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "status",
                "type": "text",
                "label": "Status",
                "required": "true",
                "webservice": "getStatusesFromMaarch",
                "placeholder": "Courrier à qualifier"
            },
            {
                "id": "subject",
                "type": "textarea",
                "label": "Sujet",
                "hint": "Liste des identifiants techniques des champs, séparés par #. Si l''''identifiant technique n''''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "required": "true",
                "placeholder": "Facture n°#invoice_number"
            },
            {
                "id": "typeId",
                "type": "text",
                "label": "Type de document",
                "required": "true",
                "webservice": "getDoctypesFromMaarch",
                "placeholder": "Facture à qualifier"
            },
            {
                "id": "typist",
                "type": "text",
                "label": "Utilisateur Rédacteur",
                "required": "true",
                "webservice": "getUsersFromMaarch",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "priority",
                "type": "text",
                "label": "Priorité",
                "required": "true",
                "webservice": "getPrioritiesFromMaarch",
                "placeholder": "Normal"
            },
            {
                "id": "format",
                "type": "text",
                "label": "Format",
                "required": "true",
                "placeholder": "pdf"
            },
            {
                "id": "modelId",
                "type": "text",
                "label": "Modèle d''''enregistrement",
                "required": "true",
                "webservice": "getIndexingModelsFromMaarch",
                "placeholder": "Facture"
            },
            {
                "id": "destination",
                "type": "text",
                "label": "Entité destinatrice",
                "required": "true",
                "webservice": "getEntitiesFromMaarch",
                "placeholder": "Service Courrier"
            },
            {
                "id": "customFields",
                "hint": "La valeur doit être de type JSON avec des doubles quotes \". La clé est l''''identifiant du custom Maarch, la valeur est l''''identifiant du champ Open-Capture",
                "type": "textarea",
                "label": "Champs personnalisés",
                "isJson": "true",
                "required": "false",
                "placeholder": "{\"1\": \"invoice_number\", \"2\": \"order_number\"}"
            }
        ]
    }
}' WHERE output_type_id = 'export_maarch' AND module = 'verifier';
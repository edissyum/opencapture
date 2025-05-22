ALTER TABLE mailcollect ADD COLUMN "method" VARCHAR(20) DEFAULT 'imap';
ALTER TABLE mailcollect ADD COLUMN "options" JSONB DEFAULT '{}';

UPDATE mailcollect SET method = 'oauth', options = jsonb_build_object(
        'login', login,
        'hostname', hostname,
        'tenant_id', tenant_id,
        'client_id', client_id,
        'secret', secret,
        'authority', authority,
        'scopes', scopes)
WHERE oauth is true;

UPDATE mailcollect SET method = 'imap', options = jsonb_build_object(
        'login', login,
        'password', password,
        'hostname', hostname,
        'port', port)
WHERE oauth is false;

ALTER TABLE mailcollect DROP COLUMN port;
ALTER TABLE mailcollect DROP COLUMN login;
ALTER TABLE mailcollect DROP COLUMN oauth;
ALTER TABLE mailcollect DROP COLUMN secret;
ALTER TABLE mailcollect DROP COLUMN scopes;
ALTER TABLE mailcollect DROP COLUMN password;
ALTER TABLE mailcollect DROP COLUMN hostname;
ALTER TABLE mailcollect DROP COLUMN tenant_id;
ALTER TABLE mailcollect DROP COLUMN client_id;
ALTER TABLE mailcollect DROP COLUMN authority;

ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "phone" VARCHAR(20);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "function" VARCHAR(255);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "civility" INTEGER;
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "lastname" VARCHAR(255);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "firstname" VARCHAR(255);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "informal_contact" BOOLEAN DEFAULT false;

CREATE TABLE "accounts_civilities" (
    "id"    SERIAL UNIQUE PRIMARY KEY,
    "label" VARCHAR(50)
);
INSERT INTO "accounts_civilities" ("label") VALUES ('Monsieur');
INSERT INTO "accounts_civilities" ("label") VALUES ('Madame');
INSERT INTO "accounts_civilities" ("label") VALUES ('Mademoiselle');
INSERT INTO "accounts_civilities" ("label") VALUES ('Autre');

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('subject', 'fra', 'Sujet', '(obje[c]?t|ref\s*:|[v,n]os\s*r[e,é]f(s?|[e,é]rence)+(\.)?|su[b]?je[c]?t|avis\s* d['',e])((\s*:\s*)|\s+)\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('subject', 'eng', 'Subject', '([o,O]bje[c]?t|[O,o,Y,y]ur\s*[r,R]ef(s?|erence)+|[s,S]u[b]?je[c]?t)\s*(:)?\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('subject_only', 'fra', 'Sujet seulement', '(obje[c]?t|su[b]?je[c]?t)((\s*:\s*)|\s+)\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('subject_only', 'eng', 'Subject only', '[o,O]bje[c]?t|[s,S]u[b]?je[c]?t\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('ref_only', 'fra', 'Réference seulement', 'ref\s*:|[v,n]os\s*r[e,é]f(s?|[e,é]rence)+(\.)?\s*.*');

INSERT INTO "outputs_types" ("output_type_id", "output_type_label", "module", "data") VALUES ('export_opencrm', 'Export vers OpenCRM', 'verifier', '{
    "options": {
        "auth": [
            {
                "id": "host",
                "type": "text",
                "label": "URL de l''hôte",
                "required": "true",
                "placeholder": "https://opencrm.integration.fr/ODE_API/"
            },
            {
                "id": "client_id",
                "type": "text",
                "label": "Identifiant du client",
                "required": "true",
                "placeholder": "bg82a6g9-dfrp-h975-6x9f-7812k89u953f"
            },
            {
                "id": "client_secret",
                "type": "text",
                "label": "Secret du client",
                "required": "false",
                "placeholder": "1fe5f48ezf1zfez1fe98zf4ez"
            }
        ],
        "parameters": [
            {
                "id": "body_template",
                "hint": "Format JSON avec les identifiants techniques des champs, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "type": "textarea",
                "label": "Contenu de l''appel API",
                "required": true,
                "placeholder": "{\n\t\"data\": {\n\t\t\"traitement\": \"OPC\",\n\t\t\"requete\": {\n\t\t\t\"dispositif\": \"OPC\",\n\t\t\t\"individu\": {\n\t\t\t\t\"nom\": \"lastname\",\n\t\t\t\t\"prenom\": \"firstname\",\n\t\t\t\t\"raison_sociale\": \"civility\",\n\t\t\t\t\"siret\": \"siret\",\n\t\t\t\t\"fonction\": \"function\",\n\t\t\t\t\"adresse_num\": \"\",\n\t\t\t\t\"adresse_voie\": \"address1\",\n\t\t\t\t\"adresse_ville\": \"city\",\n\t\t\t\t\"adresse_cp\": \"postal_code\",\n\t\t\t\t\"email\": \"email\",\n\t\t\t\t\"telephone\": \"phone\"\n\t\t\t},\n\t\t\t\"demande\": {\n\t\t\t\t\"type_courrier\": \"custom_69\",\n\t\t\t\t\"date_courrier\": \"document_date\",\n\t\t\t\t\"date_arrivee\": \"custom_70\",\n\t\t\t\t\"nature\": \"custom_68\",\n\t\t\t\t\"objet\": \"subject\"\n\t\t\t},\n\t\t\t\"documents\": [\n\t\t\t\t{\n\t\t\t\t\t\"nom\": \"original_filename\",\n\t\t\t\t\t\"type_mime\": \"mime_type\",\n\t\t\t\t\t\"base64\": \"b64_file_content\"\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t}\n}"
            }
        ]
    }
}');
INSERT INTO "outputs" ("output_type_id", "output_label", "module", "data") VALUES('export_opencrm', 'Export OpenCRM', 'verifier', '{"options": {"auth": [{"id": "host", "type": "text", "value": "https://opencrm.integration/ODE_API/"}, {"id": "client_id", "type": "text", "value": ""}, {"id": "client_secret", "type": "text", "value": ""}], "parameters": [{"id": "body_template", "type": "textarea", "value": "{\n    \"data\": {\n        \"traitement\": \"OPC\",\n        \"requete\": {\n            \"dispositif\": \"OPC\",\n            \"individu\": {\n                \"nom\": \"lastname\",\n                \"prenom\": \"firstname\",\n                \"raison_sociale\": \"civility\",\n                \"siret\": \"siret\",\n                \"fonction\": \"function\",\n                \"adresse_num\": \"\",\n                \"adresse_voie\": \"address1\",\n                \"adresse_ville\": \"city\",\n                \"adresse_cp\": \"postal_code\",\n                \"email\": \"email\",\n                \"telephone\": \"phone\"\n            },\n            \"demande\": {\n                \"type_courrier\": \"custom_\",\n                \"date_courrier\": \"document_date\",\n                \"date_arrivee\": \"custom_\",\n                \"nature\": \"custom_\",\n                \"objet\": \"subject\"\n            },\n            \"documents\": [\n                {\n                    \"nom\": \"original_filename\",\n                    \"type_mime\": \"mime_type\",\n                    \"base64\": \"b64_file_content\"\n                }\n            ]\n        }\n    }\n}"}]}}');

UPDATE "form_models" SET settings = jsonb_set(settings, '{unique_url, update_supplier}', 'true') WHERE module = 'verifier';

ALTER TABLE "accounts_supplier" ALTER COLUMN name DROP NOT NULL;

ALTER TABLE monitoring ADD COLUMN "retry" BOOLEAN DEFAULT False;
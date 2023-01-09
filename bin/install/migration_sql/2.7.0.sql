CREATE TABLE ai_models
(
    "id"                SERIAL       PRIMARY KEY,
    "model_path"        VARCHAR(50),
    "type"              VARCHAR(15),
    "train_time"        REAL,
    "accuracy_score"    REAL,
    "min_proba"         INTEGER,
    "status"            VARCHAR(10)  DEFAULT 'OK',
    "documents"         JSONB        DEFAULT '{}',
    "module"            VARCHAR(10)
);

INSERT INTO "docservers" ("description", "docserver_id", "path") VALUES ('[SPLITTER] Chemin vers le dossier contenant les données d''entraînement', 'SPLITTER_TRAIN_PATH_FILES', '/var/www/html/opencapture/bin/scripts/ai/splitter/train_data/');
INSERT INTO "docservers" ("description", "docserver_id", "path") VALUES ('[SPLITTER] Chemin vers le dossier contenant le modèle de prédiction', 'SPLITTER_AI_MODEL_PATH', '/var/www/html/opencapture/bin/scripts/ai/splitter/models/');

ALTER TABLE "accounts_customer" ADD COLUMN module VARCHAR(10);
UPDATE "accounts_customer" SET module = 'verifier' WHERE module is NULL or module = '';

ALTER TABLE "splitter_batches" ADD COLUMN customer_id INTEGER;
ALTER TABLE "splitter_batches" ADD COLUMN locked_by VARCHAR(50);
ALTER TABLE "splitter_batches" ADD COLUMN locked BOOLEAN DEFAULT False;

ALTER TABLE "users" ADD COLUMN email TEXT;

UPDATE "outputs_types" SET output_type_label = REPLACE(output_type_label, 'Maarch', 'MEM Courrier');
UPDATE "outputs_types" SET output_type_id = 'export_mem' WHERE output_type_id = 'export_maarch';
UPDATE "outputs_types" SET data = '{
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
                "label": "Activer la liaison avec un document dans MEM Courrier",
                "required": "true",
                "webservice": "",
                "placeholder": ""
            },
            {
                "id": "memCustomField",
                "type": "text",
                "label": "Champ personnalisé à récupérer",
                "required": "false",
                "webservice": "getCustomFieldsFromMem",
                "placeholder": "Numéro de devis",
                "hint": "Champ personnalisé MEM Courrier dans lequel est stocké la donnée nécessaire à la liaison avec un document"
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
                "id": "memClause",
                "type": "text",
                "label": "Clause de selection des documents dans MEM Courrier",
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
                "webservice": "getContactsCustomFieldsFromMem",
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
                "webservice": "getUsersFromMem",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "status",
                "type": "text",
                "label": "Status",
                "required": "true",
                "webservice": "getStatusesFromMem",
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
                "webservice": "getDoctypesFromMem",
                "placeholder": "Facture à qualifier"
            },
            {
                "id": "typist",
                "type": "text",
                "label": "Utilisateur Rédacteur",
                "required": "true",
                "webservice": "getUsersFromMem",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "priority",
                "type": "text",
                "label": "Priorité",
                "required": "true",
                "webservice": "getPrioritiesFromMem",
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
                "webservice": "getIndexingModelsFromMem",
                "placeholder": "Facture"
            },
            {
                "id": "destination",
                "type": "text",
                "label": "Entité destinatrice",
                "required": "true",
                "webservice": "getEntitiesFromMem",
                "placeholder": "Service Courrier"
            },
            {
                "id": "customFields",
                "hint": "La valeur doit être de type JSON avec des doubles quotes \". La clé est l''''identifiant du custom MEM Courrier, la valeur est l''''identifiant du champ Open-Capture",
                "type": "textarea",
                "label": "Champs personnalisés",
                "isJson": "true",
                "required": "false",
                "placeholder": "{\"1\": \"invoice_number\", \"2\": \"quotation_number\"}"
            }
        ]
    }
}' WHERE output_type_id = 'export_mem';

UPDATE "outputs" SET output_label = REPLACE(output_label, 'Maarch', 'MEM Courrier');
UPDATE "outputs" SET output_type_id = 'export_mem' WHERE output_type_id = 'export_maarch';
UPDATE "outputs" SET data = REPLACE(data::TEXT, 'getUsersFromMaarch', 'getUsersFromMem')::JSONB WHERE output_type_id = 'export_mem';
UPDATE "outputs" SET data = REPLACE(data::TEXT, 'getStatusesFromMaarch', 'getStatusesFromMem')::JSONB WHERE output_type_id = 'export_mem';
UPDATE "outputs" SET data = REPLACE(data::TEXT, 'getEntitiesFromMaarch', 'getEntitiesFromMem')::JSONB WHERE output_type_id = 'export_mem';
UPDATE "outputs" SET data = REPLACE(data::TEXT, 'getDoctypesFromMaarch', 'getDoctypesFromMem')::JSONB WHERE output_type_id = 'export_mem';
UPDATE "outputs" SET data = REPLACE(data::TEXT, 'getPrioritiesFromMaarch', 'getPrioritiesFromMem')::JSONB WHERE output_type_id = 'export_mem';
UPDATE "outputs" SET data = REPLACE(data::TEXT, 'getCustomFieldsFromMaarch', 'getCustomFieldsFromMem')::JSONB WHERE output_type_id = 'export_mem';
UPDATE "outputs" SET data = REPLACE(data::TEXT, 'getIndexingModelsFromMaarch', 'getIndexingModelsFromMem')::JSONB WHERE output_type_id = 'export_mem';
UPDATE "outputs" SET data = REPLACE(data::TEXT, 'getContactsCustomFieldsFromMaarch', 'getContactsCustomFieldsFromMem')::JSONB WHERE output_type_id = 'export_mem';

ALTER TABLE mailcollect ALTER COLUMN folder_trash DROP NOT NULL;

INSERT INTO "privileges" ("label", "parent") VALUES ('user_quota', 'general');
INSERT INTO "privileges" ("label", "parent") VALUES ('list_ai_model', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('create_ai_model', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_ai_model', 'splitter');

ALTER TABLE users ADD COLUMN "refresh_token" TEXT;
INSERT INTO "configurations" ("label", "data") VALUES ('verifierOrderSearch', '{"type": "list", "value": "desc", "options": ["asc", "desc"], "description": "Choix de l''ordre de recherche des informations dans le module Verifier"}');

ALTER TABLE mailcollect RENAME COLUMN splitter_technical_workflow_id TO splitter_workflow_id;

ALTER TABLE accounts_supplier DROP COLUMN lang;

INSERT INTO "outputs_types" ("output_type_id", "output_type_label", "module", "data") VALUES ('export_coog', 'Export vers COOG', 'verifier', '{
    "options": {
        "auth": [
            {
                "id": "host",
                "type": "text",
                "label": "URL de l''hôte",
                "required": "true",
                "placeholder": "https://coog.edissyum-dev.com/gateway"
            },
            {
                "id": "token",
                "type": "text",
                "label": "Token d''authentification",
                "required": "true",
                "placeholder": "ujx8ke67izyc6q3vvh96520a96a54frgjrpgl85kk4sb0tv3"
            },
            {
                "id": "cert_path",
                "type": "text",
                "label": "Chemin vers le certificat",
                "required": "false",
                "placeholder": "/home/user/cert.cer"
            }
        ],
        "parameters": [
            {
                "id": "body_template",
                "hint": "Format JSON avec les identifiants techniques des champs, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "type": "textarea",
                "label": "Contenu de l''appel API",
                "label": "Contenu de l''appel API",
                "required": true,
                "placeholder": "[{\n\t\"ref\": \"invoice_number\",\n\t\"state\": \"custom_1\",\n\t\"reception_date\": \"register_date_full\",\n\t\"activity_field\": {\"code\": \"custom_2\"},\n\t\"reception_channel\": {\"code\": \"custom_3\"},\n\t\"task_type\": {\"code\": \"traitement\"},\n\t\"priority\": {\"code\": \"normale\"},\n\t\"affected_to\": \"custom_4\",\n\t\"summary\": \"Date de la tâche : #register_date_full\",\n\t\"references\": [\n\t\t{\n\t\t\t\"type\": \"claim\",\n\t\t\t\"reference\": \"#custom_5\"\n\t\t}\n\t],\n\t\"attachments\": [\n\t\t{\n\t\t\t\"content\": {\n\t\t\t\t\"type\": \"data\",\n\t\t\t\t\"data\": \"b64_file_content\",\n\t\t\t\t\"filename\": \"original_filename\"\n\t\t\t}\n\t\t}\n\t]\n}]"
            }
        ]
    }
}');

INSERT INTO "outputs_types" ("output_type_id", "output_type_label", "data", "module") VALUES ('export_verifier', 'Export Vérificateur','{
    "options": {
        "parameters": [
            {
                "id": "body_template",
                "hint": "Format JSON avec les identifiants techniques des champs, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "type": "textarea",
                "label": "Contenu de l''appel API",
                "required": true,
                "placeholder": "{\n\t\"workflowId\": \"default_workflow\",\n\t\"datas\": {\n\t\t\"custom_1\": \"state_task_splitter\",\n\t\t\"custom_2\": \"emetteur_splitter\",\n\t\t\"custom_3\": \"activity_splitter\"\n\t\t\"custom_9\": \"user_splitter\"\n\t},\n\t\"files\": []\n}"
            }
        ]
    }
}', 'splitter');

INSERT INTO "outputs_types" ("output_type_id", "output_type_label", "data", "module") VALUES ('export_opencaptureformem', 'Export Open-Capture For MEM', '{
    "options": {
        "auth": [
            {
                "id": "host",
                "type": "text",
                "label": "URL de l''hôte",
                "required": "true",
                "placeholder": "http://192.168.10.100/opencaptureformem/"
            },
            {
                "id": "secret_key",
                "type": "text",
                "label": "Clé secrète",
                "required": "true",
                "placeholder": "fc7594767dbcf20b13938ee849031496adf61c9d365e2cabab2558ae737e9d7f"
            },
            {
                "id": "custom_id",
                "type": "text",
                "label": "Identifiant du custom",
                "required": "true",
                "placeholder": "opencaptureformem"
            }
        ],
        "parameters": [
            {
                "id": "process",
                "type": "text",
                "label": "Nom du processus",
                "required": true,
                "webservice": "getProcessFromOCForMEM",
                "placeholder": "incoming"
            },
            {
                "id": "pdf_filename",
                "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "type": "text",
                "label": "Nom du fichier PDF",
                "required": "true",
                "placeholder": "doctype#random"
            },
            {
                "id": "separator",
                "hint": "",
                "type": "text",
                "label": "Séparateur",
                "required": "true",
                "placeholder": "_"
            },
            {
                "id": "destination",
                "hint": "",
                "type": "text",
                "label": "Destination",
                "required": "false",
                "placeholder": "DGS"
            },
            {
                "id": "rdff",
                "type": "select",
                "label": "Lecture de la destination depuis le nom du fichier",
                "hint": "Lecture de la destination depuis le nom du fichier",
                "required": "true",
                "values": [
                    {
                        "value": "True",
                        "label": "Oui"
                    },
                    {
                        "value": "False",
                        "label": "Non"
                    }
                ]
            },
            {
                "id": "custom_fields",
                "hint": "Champs JSON",
                "type": "text",
                "label": "Champs personnalisé",
                "required": "false",
                "placeholder": "{\"3\": \"Nature\"}"
            }
        ]
    }
}', 'splitter');

UPDATE "privileges" SET parent = 'general' WHERE label = 'custom_fields';
INSERT INTO "privileges" ("label", "parent") VALUES ('custom_fields_advanced', 'administration');

ALTER TABLE "documents" ADD COLUMN "md5" VARCHAR(32);
ALTER TABLE "splitter_batches" ADD COLUMN "md5" VARCHAR(32);

INSERT INTO "status" ("id", "label", "label_long", "module") VALUES ('WAIT_THIRD_PARTY', 'En attente fournisseur', 'En attente de création / modification de fiche fournisseur', 'verifier');
UPDATE workflows SET process = process || '{"allow_third_party_validation": false}' WHERE module = 'verifier';

ALTER TABLE accounts_supplier ADD COLUMN "default_accounting_plan" INTEGER;

INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('VERIFIER_ATTACHMENTS', '[VERIFIER] Chemin vers le dossier contenant les pièces jointes', '/var/docservers/opencapture/verifier/attachments/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SPLITTER_ATTACHMENTS', '[SPLITTER] Chemin pour le stockage des pièces jointes', '/var/docservers/opencapture/splitter/attachments/');

ALTER TABLE mailcollect ADD COLUMN secret VARCHAR;
ALTER TABLE mailcollect ADD COLUMN tenant_id VARCHAR;
ALTER TABLE mailcollect ADD COLUMN client_id VARCHAR;
ALTER TABLE mailcollect ADD COLUMN oauth BOOLEAN DEFAULT FALSE;
ALTER TABLE mailcollect ADD COLUMN scopes VARCHAR DEFAULT 'https://outlook.office.com/.default';
ALTER TABLE mailcollect ADD COLUMN authority VARCHAR DEFAULT 'https://login.microsoftonline.com/';

INSERT INTO configurations ("label", "data") VALUES ('enableProcessWatcher', '{"type": "bool", "value": true, "description": "Activer l''affichage des processus en cours en bas à droite de l''écran"}');

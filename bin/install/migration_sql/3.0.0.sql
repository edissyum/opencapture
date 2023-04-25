ALTER TABLE users ADD COLUMN "mode" VARCHAR(10) DEFAULT 'standard';

ALTER TABLE roles ALTER COLUMN "label" SET DATA TYPE VARCHAR(255);

ALTER TABLE monitoring ADD COLUMN "token" VARCHAR(255);
ALTER TABLE monitoring ADD COLUMN "workflow_id" VARCHAR(255);

WITH new_role_id as (
    INSERT INTO roles ("label_short", "label", "editable") VALUES ('user_ws', 'Utilisateur WebServices', 'true') returning id
)
INSERT INTO roles_privileges ("role_id", "privileges_id") VALUES ((SELECT id from new_role_id), '{"data" : "[3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 52, 54, 55]"}');

UPDATE privileges set label = 'list_ai_model_splitter' WHERE label = 'list_ai_model' AND parent = 'splitter';
UPDATE privileges set label = 'update_status_splitter' WHERE label = 'update_status' AND parent = 'splitter';
UPDATE privileges set label = 'create_ai_model_splitter' WHERE label = 'create_ai_model' AND parent = 'splitter';
UPDATE privileges set label = 'update_ai_model_splitter' WHERE label = 'update_ai_model' AND parent = 'splitter';

INSERT INTO "privileges" ("label", "parent") VALUES ('access_config', 'administration');
INSERT INTO "privileges" ("label", "parent") VALUES ('workflows_list', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('add_workflow', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_workflow', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('workflows_list_splitter', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('add_workflow_splitter', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_workflow_splitter', 'splitter');

CREATE TABLE IF NOT EXISTS "workflows" (
     "id"                SERIAL       UNIQUE PRIMARY KEY,
     "workflow_id"       VARCHAR(255) NOT NULL,
     "label"             VARCHAR(255) NOT NULL,
     "module"            VARCHAR(10)  NOT NULL,
     "status"            VARCHAR(10)  DEFAULT 'OK',
     "input"             JSONB        DEFAULT '{}',
     "process"           JSONB        DEFAULT '{}',
     "separation"        JSONB        DEFAULT '{}',
     "output"            JSONB        DEFAULT '{}'
);
INSERT INTO "workflows" ("id", "workflow_id", "label", "module", "input", "process", "separation", "output") VALUES (1, 'default_workflow', 'Workflow par défaut', 'verifier', '{"workflow_id": "default_workflow", "input_folder": "/var/share/edissyum/entrant/verifier/", "apply_process": true, "workflow_label": "Workflow par défaut"}', '{"form_id": 1, "rotation": "no_rotation", "system_fields": ["supplier", "invoice_number", "quotation_number", "document_date", "document_due_date", "footer"], "use_interface": true}', '{"remove_blank_pages": true, "splitter_method_id": "no_sep", "separate_by_document_number_value": 2}', '{"outputs_id": [1, 3]}');

UPDATE configurations SET label = 'smtp' WHERE label = 'mailCollectGeneral';
UPDATE configurations SET data = REPLACE (data::TEXT, 'Paramétrage par défaut du MailCollect', 'Paramétrage de l''envoi d''email SMTP')::JSONB WHERE label = 'smtp';
UPDATE configurations SET data = data #- '{value, smtpSSL}' WHERE label = 'smtp';
UPDATE configurations SET data = data #- '{value, smtpStartTLS}' WHERE label = 'smtp';
UPDATE configurations SET data = jsonb_set(data, '{value, smtpProtocoleSecure}', 'false') WHERE label = 'smtp';

INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('MAILCOLLECT_BATCHES', 'Chemin de stockage des batches du module MailCollect', '/var/www/html/opencapture/bin/data/MailCollect/');

ALTER TABLE users ADD COLUMN IF NOT EXISTS "mode" VARCHAR(10) DEFAULT 'standard';

ALTER TABLE roles ALTER COLUMN "label" SET DATA TYPE VARCHAR(255);

ALTER TABLE invoices RENAME TO documents;

ALTER TABLE monitoring ADD COLUMN IF NOT EXISTS "token" VARCHAR(255);
ALTER TABLE monitoring ADD COLUMN IF NOT EXISTS "workflow_id" VARCHAR(255);

WITH new_role_id as (
    INSERT INTO roles ("label_short", "label", "editable") VALUES ('user_ws', 'Utilisateur WebServices', 'true') returning id
)
INSERT INTO roles_privileges ("role_id", "privileges_id") VALUES ((SELECT id from new_role_id), '{"data" : "[1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 52, 54, 55]"}');

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

UPDATE configurations SET label = 'smtp' WHERE label = 'mailCollectGeneral';
UPDATE configurations SET data = REPLACE (data::TEXT, 'Paramétrage par défaut du MailCollect', 'Paramétrage de l''envoi d''email SMTP')::JSONB WHERE label = 'smtp';
UPDATE configurations SET data = data #- '{value, smtpSSL}' WHERE label = 'smtp';
UPDATE configurations SET data = data #- '{value, smtpStartTLS}' WHERE label = 'smtp';
UPDATE configurations SET data = jsonb_set(data, '{value, smtpProtocoleSecure}', 'false') WHERE label = 'smtp';

INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('MAILCOLLECT_BATCHES', 'Chemin de stockage des batches du module MailCollect', '/var/www/html/opencapture/bin/data/MailCollect/');

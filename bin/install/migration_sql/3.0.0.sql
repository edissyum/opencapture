ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mode" VARCHAR(10) DEFAULT 'standard';

ALTER TABLE "roles" ALTER COLUMN "label" SET DATA TYPE VARCHAR(255);

ALTER TABLE "invoices" RENAME TO documents;

ALTER TABLE "monitoring" DROP COLUMN IF EXISTS "input_id";
ALTER TABLE "monitoring" ADD COLUMN IF NOT EXISTS "token" VARCHAR(255);
ALTER TABLE "monitoring" ADD COLUMN IF NOT EXISTS "workflow_id" VARCHAR(255);

WITH new_role_id as (
    INSERT INTO "roles" ("label_short", "label", "editable") VALUES ('user_ws', 'Utilisateur WebServices', 'true') returning id
)
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES ((SELECT id from new_role_id), '{"data" : "[1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 52, 54, 55]"}');

DELETE FROM "form_model_settings" WHERE module = 'verifier';
INSERT INTO "form_model_settings" ("module", "settings") VALUES ('verifier', '{
     "display": {
          "subtitles": [
               {"id": "invoice_number", "label": "FACTURATION.invoice_number"},
               {"id": "document_date", "label": "FACTURATION.document_date"},
               {"id": "date", "label": "VERIFIER.register_date"},
               {"id": "original_filename", "label": "VERIFIER.original_file"},
               {"id": "form_label", "label": "ACCOUNTS.form"}
          ]
     },
     "unique_url": {
          "expiration": 7,
          "change_form": true,
          "create_supplier": true,
          "enable_supplier": true,
          "refuse_document": true,
          "validate_document": true
     },
     "supplier_verif": false
}');

UPDATE "privileges" set label = 'list_ai_model_splitter' WHERE label = 'list_ai_model' AND parent = 'splitter';
UPDATE "privileges" set label = 'update_status_splitter' WHERE label = 'update_status' AND parent = 'splitter';
UPDATE "privileges" set label = 'create_ai_model_splitter' WHERE label = 'create_ai_model' AND parent = 'splitter';
UPDATE "privileges" set label = 'update_ai_model_splitter' WHERE label = 'update_ai_model' AND parent = 'splitter';
UPDATE "privileges" set label = 'verifier_settings' WHERE label = 'verifier_display';

INSERT INTO "privileges" ("label", "parent") VALUES ('add_workflow', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('workflows_list', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_workflow', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('access_config', 'administration');
INSERT INTO "privileges" ("label", "parent") VALUES ('add_workflow_splitter', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('workflows_list_splitter', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_workflow_splitter', 'splitter');

DELETE FROM "privileges" WHERE "label" = 'add_input';
DELETE FROM "privileges" WHERE "label" = 'inputs_list';
DELETE FROM "privileges" WHERE "label" = 'update_input';
DELETE FROM "privileges" WHERE "label" = 'add_input_splitter';
DELETE FROM "privileges" WHERE "label" = 'inputs_list_splitter';
DELETE FROM "privileges" WHERE "label" = 'update_input_splitter';

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

INSERT INTO "workflows" ("workflow_id", "label", "module", "input", "process", "separation", "output")
     SELECT
          CONCAT(input_id),
          CONCAT(input_label, ' Workflow'),
          'verifier',
          CONCAT('{"apply_process": true, "facturx_only": false, "input_folder": "', input_folder, '", "ai_model_id": "', ai_model_id,
             '", "customer_id": "', customer_id, '"}')::JSONB,
          CONCAT('{"delete_documents": false, "allow_automatic_validation": false, "use_interface": true, "rotation": "no_rotation", "form_id": "', default_form_id,
              '", "override_supplier_form": "', override_supplier_form,
              '", "system_fields": ["name", "invoice_number", "quotation_number", "delivery_number", "document_date", "document_due_date", "footer"]', '}')::JSONB,
          CONCAT('{"remove_blank_pages": "', remove_blank_pages,'", "splitter_method_id": "', splitter_method_id, '"}')::JSONB,
          '{}'
     FROM inputs
     WHERE module = 'verifier';

DROP TABLE inputs;

UPDATE form_models SET settings = jsonb_set(settings, '{unique_url}', '{"expiration": 7,
     "change_form": true,
     "create_supplier": true,
     "enable_supplier": true,
     "refuse_document": true,
     "validate_document": true,
     "allow_supplier_autocomplete": true}') WHERE module = 'verifier';

UPDATE form_model_settings SET settings = jsonb_set(settings, '{unique_url}', '{"expiration": 7,
     "change_form": true,
     "create_supplier": true,
     "enable_supplier": true,
     "refuse_document": true,
     "validate_document": true,
     "allow_supplier_autocomplete": true}') WHERE module = 'verifier';

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('duns', 'global', 'Numéro DUNS', '([0-9]{9})|([0-9]{2}-[0-9]{3}-[0-9]{4})');
ALTER TABLE "accounts_supplier" ADD COLUMN "duns" VARCHAR(10);

ALTER TABLE mailcollect RENAME COLUMN splitter_technical_input_id TO splitter_technical_workflow_id;

ALTER TABLE documents ADD COLUMN "workflow_id" INTEGER DEFAULT null;

ALTER TABLE splitter_batches ADD COLUMN "workflow_id" INTEGER DEFAULT null;
UPDATE outputs_types SET data = '{
  "options": {
    "auth": [],
    "parameters": [
      {
        "id": "folder_out",
        "type": "text",
        "label": "Dossier de sortie",
        "required": "true",
        "placeholder": "/var/share/sortant"
      },
      {
        "id": "filename",
        "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
        "type": "text",
        "label": "Nom du fichier",
        "required": "true",
        "placeholder": "doctype#nom#prenom#date"
      },
      {
        "id": "separator",
        "type": "text",
        "label": "Séparateur",
        "required": "true",
        "placeholder": "_"
      },
      {
        "id": "extension",
        "hint": "Ne pas mettre de point dans l''extension",
        "type": "text",
        "label": "Extension du fichier",
        "required": "true",
        "placeholder": "pdf"
      },
      {
        "id": "zip_filename",
        "hint": "Compresser les fichiers exportés, [excepté=doctype1] mentionne les types de document à exclure de la compression",
        "type": "text",
        "label": "Nom du fichier compressé",
        "required": "false",
        "placeholder": "splitter-files[Except=doctype1,doctype2]"
      }
    ]
  }
}' WHERE output_type_id = 'export_pdf' and module = 'splitter';

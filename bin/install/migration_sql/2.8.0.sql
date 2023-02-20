UPDATE configurations SET display = false WHERE label = 'locale';

ALTER TABLE inputs ADD COLUMN ai_model_id INTEGER;
ALTER TABLE ai_models ADD COLUMN model_label VARCHAR;

INSERT INTO "privileges" ("label", "parent") VALUES ('list_ai_model', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('create_ai_model', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_ai_model', 'verifier');

ALTER TABLE users ADD COLUMN "reset_token" TEXT;

INSERT INTO "configurations" ("label", "data", "display") VALUES ('passwordRules', '{
    "type": "json",
    "value": {
        "minLength": 7,
        "uppercaseMandatory": true,
        "numberMandatory": true,
        "specialCharMandatory": true
    },
    "description": ""
}', false);

DROP INDEX docservers_path_uindex;
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('INPUTS_ALLOWED_PATH', 'Chemin autorisé du dossier d''entrée des fichiers importés', '/var/share/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('OUTPUTS_ALLOWED_PATH', 'Chemin autorisé du dossier de sortie des fichiers exportés', '/var/share/');

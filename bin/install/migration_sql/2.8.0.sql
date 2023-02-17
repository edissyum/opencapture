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

CREATE TABLE monitoring
(
    "id"                 SERIAL      UNIQUE PRIMARY KEY,
    "module"             VARCHAR(10),
    "source"             VARCHAR(10),
    "creation_date"      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    "modification_date"  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    "end_date"           TIMESTAMP,
    "steps"              JSONB       DEFAULT '{}'
);
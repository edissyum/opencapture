UPDATE configurations SET display = false WHERE label = 'locale';

ALTER TABLE inputs ADD COLUMN ai_model_id INTEGER;
ALTER TABLE ai_models ADD COLUMN model_label VARCHAR;

INSERT INTO "privileges" ("label", "parent") VALUES ('list_ai_model', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('create_ai_model', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_ai_model', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('monitoring', 'general');

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
    "id"                 SERIAL         UNIQUE PRIMARY KEY,
    "status"             VARCHAR(10),
    "elapsed_time"       VARCHAR(20),
    "error"              BOOLEAN        DEFAULT False,
    "module"             VARCHAR(10)    NOT NULL,
    "source"             VARCHAR(10)    NOT NULL,
    "creation_date"      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date"           TIMESTAMP,
    "filename"           VARCHAR(255),
    "steps"              JSONB          DEFAULT '{}'
);
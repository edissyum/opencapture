INSERT INTO "form_models" ("label", "default_form", "outputs", "module", "settings") VALUES ('OCRisation simple', false, '{}', 'verifier',  '{
    "supplier_verif": false,
    "automatic_validation_data": "only_ocr",
    "allow_automatic_validation": true,
    "delete_documents_after_outputs": true
}');
INSERT INTO "form_models_field" ("form_id", "fields") VALUES (2, '{"other": [], "supplier": []}');

ALTER TABLE mailcollect ALTER COLUMN secured_connection TYPE BOOLEAN USING(secured_connection::boolean);
ALTER TABLE mailcollect ALTER COLUMN secured_connection SET DEFAULT true;

ALTER TABLE addresses ALTER COLUMN postal_code TYPE VARCHAR(50);

ALTER TABLE users ADD COLUMN "last_connection" TIMESTAMP;

INSERT INTO configurations ("label", "data") VALUES ('allowUserMultipleLogin', '{"type": "bool", "value": true, "description": "Autoriser un utilisateur à être connecté sur plusieurs machines simultanément"}');

DELETE FROM configurations WHERE "label" = 'compressionQuality';
DELETE FROM configurations WHERE "label" = 'resolution';

ALTER TABLE users ADD COLUMN email TEXT;

INSERT INTO "privileges" ("label", "parent") VALUES ('user_quota', 'general');

INSERT INTO "configurations" ("label", "data", "display") VALUES ('userQuota', '{
    "type": "json",
    "value": {
        "enabled": false,
        "quota": 20,
        "users_filtered":  ["admin", "admin_fct"]
    },
    "description": ""
}', false);
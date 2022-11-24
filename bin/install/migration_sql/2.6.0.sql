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

INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "data", "module") VALUES (7, 'export_openads', 'Export OpenADS','{
  "options": {
    "auth": [
      {
        "id": "openads_api",
        "type": "text",
        "label": "OpenAds api",
        "required": "true",
        "placeholder": "https://example.com/demo/openads\n"
      },
      {
        "id": "login",
        "type": "text",
        "label": "Pseudo de l''''utilisateur WS",
        "required": "true",
        "placeholder": "opencapture"
      },
      {
        "id": "password",
        "type": "password",
        "label": "Mot de passe de l''''utilisateur WS",
        "required": "true",
        "placeholder": "opencapture"
      }
    ],
    "parameters": [
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
        "id": "folder_id",
        "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
        "type": "text",
        "label": "Identifiant du dossier",
        "required": "true",
        "placeholder": "_"
      }
    ]
  }
}', 'splitter');
ALTER SEQUENCE "outputs_types_id_seq" RESTART WITH 8;

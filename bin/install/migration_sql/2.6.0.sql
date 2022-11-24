INSERT INTO "form_models" ("label", "default_form", "outputs", "module", "settings") VALUES ('OCRisation simple', false, '{}', 'verifier',  '{
    "supplier_verif": false,
    "automatic_validation_data": "only_ocr",
    "allow_automatic_validation": true,
    "delete_documents_after_outputs": true
}');
INSERT INTO "form_models_field" ("form_id", "fields") VALUES (2, '{"other": [], "supplier": []}');
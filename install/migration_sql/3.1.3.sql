ALTER TABLE accounts_supplier ADD COLUMN rccm VARCHAR(30);

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('rccm', 'global', 'Numéro RCCM', '[aA-zZ]{2}-[aA-zZ]{3}-[0-9]{2}-[0-9]{4}-[aA-zZ]{1}[0-9]{2}-[0-9]{5}');

UPDATE form_models_field
SET fields = jsonb_set(fields, '{batch_metadata}', (
    SELECT jsonb_agg(jsonb_set(form_field, '{invert_fields}', '[]'::jsonb))
    FROM jsonb_array_elements(fields->'batch_metadata') AS form_field
)::jsonb)
WHERE fields->'batch_metadata' IS NOT NULL;

UPDATE form_models_field
SET fields = jsonb_set(fields, '{batch_metadata}', (
    SELECT jsonb_agg(jsonb_set(form_field, '{conditioned_fields}', '[]'::jsonb))
    FROM jsonb_array_elements(fields->'batch_metadata') AS form_field
)::jsonb)
WHERE fields->'batch_metadata' IS NOT NULL;

UPDATE form_models_field
SET fields = jsonb_set(fields, '{batch_metadata}', (
    SELECT jsonb_agg(jsonb_set(form_field, '{conditioned_doctypes}', '[]'::jsonb))
    FROM jsonb_array_elements(fields->'batch_metadata') AS form_field
)::jsonb)
WHERE fields->'batch_metadata' IS NOT NULL;

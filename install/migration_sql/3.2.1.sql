UPDATE form_models
SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{unique_doctype}',
    'false'::jsonb,
    TRUE
)
where module = 'splitter';
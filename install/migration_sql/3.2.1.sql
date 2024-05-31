UPDATE form_models
SET settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{unique_doc_type}',
    'false'::jsonb,
    TRUE
)
where module = 'splitter';
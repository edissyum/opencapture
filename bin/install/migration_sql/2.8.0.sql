UPDATE configurations SET display = false WHERE label = 'locale';

ALTER TABLE inputs ADD COLUMN ai_model_id INTEGER;
ALTER TABLE ai_models ADD COLUMN model_label VARCHAR;
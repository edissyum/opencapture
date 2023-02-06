UPDATE configurations SET display = false WHERE label = 'locale';

ALTER TABLE ai_models ADD COLUMN input_id INTEGER;
ALTER TABLE users ADD COLUMN "mode" VARCHAR(10) DEFAULT 'standard';

ALTER TABLE roles ALTER COLUMN "label" SET DATA TYPE VARCHAR(255);

WITH new_role_id as (
    INSERT INTO roles ("label_short", "label", "editable") VALUES ('user_wsa', 'Utilisateur WebServices', 'true') returning id
)
INSERT INTO roles_privileges ("role_id", "privileges_id") VALUES ((SELECT id from new_role_id), '{"data" : "[3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 52, 54, 55]"}');

UPDATE privileges set label = 'list_ai_model_splitter' WHERE label = 'list_ai_model' AND parent = 'splitter';
UPDATE privileges set label = 'update_status_splitter' WHERE label = 'update_status' AND parent = 'splitter';
UPDATE privileges set label = 'create_ai_model_splitter' WHERE label = 'create_ai_model' AND parent = 'splitter';
UPDATE privileges set label = 'update_ai_model_splitter' WHERE label = 'update_ai_model' AND parent = 'splitter';

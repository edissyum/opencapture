CREATE TABLE ai_models
(
    "id"                    SERIAL       PRIMARY KEY,
    "model_path"            VARCHAR(50),
    "train_time"            REAL,
    "type"                  VARCHAR(15),
    "status"                VARCHAR(10)  DEFAULT 'OK',
    "accuracy_score"        REAL,
    "min_proba"             INTEGER,
    "documents"             JSONB        DEFAULT '{}'
);

INSERT INTO "docservers" ("description", "docserver_id", "path") VALUES ('[SPLITTER] Chemin vers le dossier contenant les données d''entraînement', 'SPLITTER_TRAIN_PATH_FILES', '/var/www/html/opencapture/bin/scripts/ai/splitter/train_data');
INSERT INTO "docservers" ("description", "docserver_id", "path") VALUES ('[SPLITTER] Chemin vers le dossier contenant le modèle de prédiction', 'SPLITTER_AI_MODEL_PATH', '/var/www/html/opencapture/bin/scripts/ai/splitter/models/');

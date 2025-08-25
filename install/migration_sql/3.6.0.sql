INSERT INTO "privileges" ("label", "parent") VALUES ('add_llm_models', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('list_llm_models', 'verifier');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_llm_models', 'verifier');

CREATE TABLE "ai_llm" (
    "id"           SERIAL       UNIQUE PRIMARY KEY,
    "name"         VARCHAR(50)  NOT NULL,
    "provider"     VARCHAR(10)  NOT NULL,
    "url"          VARCHAR(255),
    "api_key"      VARCHAR(255),
    "json_content" JSONB        DEFAULT '{}',
    "settings"     JSONB        DEFAULT '{}',
    "status"       VARCHAR(10)  DEFAULT 'OK'
);
INSERT INTO "ai_llm" ("id", "name", "provider", "url", "api_key", "json_content")
VALUES (1, 'Mistral AI', 'mistral','https://api.mistral.ai/v1/chat/completions','', '{}');

DELETE FROM configurations WHERE label = 'enableProcessWatcher';

UPDATE workflows SET process = process || '{"ai_llm": "no_ai_llm"}';

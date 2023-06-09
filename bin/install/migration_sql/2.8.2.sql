CREATE TABLE "users_forms"
(
    "id"       SERIAL UNIQUE PRIMARY KEY,
    "user_id"  INTEGER,
    "forms_id" JSONB DEFAULT '{}'
);

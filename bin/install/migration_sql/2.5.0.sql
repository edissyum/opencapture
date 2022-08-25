-- Add MailCollect settings interface
INSERT INTO "privileges" ("id", "label", "parent") VALUES ('mailcollect', 'general');

ALTER TABLE "configurations" ADD COLUMN display BOOLEAN default true;
INSERT INTO "configurations" (label, data, display) VALUES ('mailCollectGeneral', '{
    "type": "json",
    "value": {
        "batchPath": "/var/www/html/opencaptureforinvoices/bin/data/MailCollect/",
        "smtpNotifOnError": true,
        "smtpSSL": true,
        "smtpStartTLS": false,
        "smtpHost": "",
        "smtpPort": "",
        "smtpLogin": "",
        "smtpPwd": "",
        "smtpFromMail": "",
        "smtpDestAdminMail": "",
        "smtpDelay": "30"
	},
    "description": "Paramétrage par défaut du MailCollect"
}', false);

CREATE TABLE mailcollect (
    "id"                            SERIAL       UNIQUE PRIMARY KEY,
    "name"                          VARCHAR(255) UNIQUE NOT NULL,
    "hostname"                      VARCHAR(255) NOT NULL,
    "port"                          INTEGER      NOT NULL,
    "login"                         VARCHAR(255) NOT NULL,
    "password"                      VARCHAR(255) NOT NULL,
    "secured_connection"            VARCHAR(255) NOT NULL,
    "is_splitter"                   BOOLEAN      DEFAULT False,
    "splitter_technical_input_id"   VARCHAR(255),
    "folder_to_crawl"               VARCHAR(255) NOT NULL,
    "folder_destination"            VARCHAR(255) NOT NULL,
    "folder_trash"                  VARCHAR(255) NOT NULL,
    "action_after_process"          VARCHAR(255) NOT NULL,
    "verifier_customer_id"          INTEGER,
    "verifier_form_id"              INTEGER
);
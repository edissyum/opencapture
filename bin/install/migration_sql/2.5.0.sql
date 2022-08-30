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
        "smtpAuth": "",
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
    "status"                        VARCHAR(10)  DEFAULT 'OK',
    "secured_connection"            VARCHAR(255) NOT NULL,
    "is_splitter"                   BOOLEAN      DEFAULT False,
    "enabled"                       BOOLEAN      DEFAULT True,
    "splitter_technical_input_id"   VARCHAR(255),
    "folder_to_crawl"               VARCHAR(255) NOT NULL,
    "folder_destination"            VARCHAR(255) NOT NULL,
    "folder_trash"                  VARCHAR(255) NOT NULL,
    "action_after_process"          VARCHAR(255) NOT NULL,
    "verifier_customer_id"          INTEGER,
    "verifier_form_id"              INTEGER
);

-- Add regex for Splitter XML output
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_doc_loop', 'fra', 'Boucle des documents dans la sortie XML du Splitter', '<!-- %BEGIN-DOCUMENT-LOOP -->(.*?)<!-- %END-DOCUMENT-LOOP -->');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_condition', 'fra', 'Condition des balises dans la sortie XML du Splitter', '<!-- %BEGIN-IF(.*?) -->(.*?)<!-- %END-IF -->');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_xml_comment', 'fra', 'Commentaire technique dans la sortie XML du Splitter', '\s?<!--[\s\S\n]*?-->\s');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_empty_line', 'fra', 'Lignes vides dans la sortie XML du Splitter', '^\s*$');

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_doc_loop', 'eng', 'Document loop in Splitter XML output', '<!-- %BEGIN-DOCUMENT-LOOP -->(.*?)<!-- %END-DOCUMENT-LOOP -->');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_condition', 'eng', 'Conditions in Splitter XML output', '<!-- %BEGIN-IF(.*?) -->(.*?)<!-- %END-IF -->');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_xml_comment', 'eng', 'Tech comments in Splitter XML output', '\s?<!--[\s\S\n]*?-->\s');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_empty_line', 'eng', 'Empty line in Splitter XML output', '^\s*$');

-- Create tasks watcher
create table tasks_watcher
(
    "id"              SERIAL      UNIQUE PRIMARY KEY,
    "title"           VARCHAR(255),
    "type"            VARCHAR(10),
    "module"          VARCHAR(10),
    "status"          VARCHAR(10),
    "creation_date"   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "end_date"        TIMESTAMP
);
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
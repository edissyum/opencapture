ALTER TABLE mailcollect ADD COLUMN "method" VARCHAR(20) DEFAULT 'imap';
ALTER TABLE mailcollect ADD COLUMN "options" JSONB DEFAULT '{}';

ALTER TABLE mailcollect DROP COLUMN hostname;
ALTER TABLE mailcollect DROP COLUMN port;
ALTER TABLE mailcollect DROP COLUMN login;
ALTER TABLE mailcollect DROP COLUMN password;
ALTER TABLE mailcollect DROP COLUMN tenant_id;
ALTER TABLE mailcollect DROP COLUMN client_id;
ALTER TABLE mailcollect DROP COLUMN scopes;
ALTER TABLE mailcollect DROP COLUMN authority;
ALTER TABLE mailcollect DROP COLUMN secret;
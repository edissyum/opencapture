ALTER TABLE mailcollect ADD COLUMN "method" VARCHAR(20) DEFAULT 'imap';
ALTER TABLE mailcollect ADD COLUMN "options" JSONB DEFAULT '{}';

UPDATE mailcollect SET method = 'oauth', options = jsonb_build_object(
        'login', login,
        'hostname', hostname,
        'tenant_id', tenant_id,
        'client_id', client_id,
        'secret', secret,
        'authority', authority,
        'scopes', scopes)
WHERE oauth is true;

UPDATE mailcollect SET method = 'imap', options = jsonb_build_object(
        'login', login,
        'password', password,
        'hostname', hostname,
        'port', port)
WHERE oauth is false;

ALTER TABLE mailcollect DROP COLUMN port;
ALTER TABLE mailcollect DROP COLUMN login;
ALTER TABLE mailcollect DROP COLUMN oauth;
ALTER TABLE mailcollect DROP COLUMN secret;
ALTER TABLE mailcollect DROP COLUMN scopes;
ALTER TABLE mailcollect DROP COLUMN password;
ALTER TABLE mailcollect DROP COLUMN hostname;
ALTER TABLE mailcollect DROP COLUMN tenant_id;
ALTER TABLE mailcollect DROP COLUMN client_id;
ALTER TABLE mailcollect DROP COLUMN authority;

ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "phone" VARCHAR(20);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "function" VARCHAR(255);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "civility"  VARCHAR(255);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "lastname"  VARCHAR(255);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "firstname" VARCHAR(255);
ALTER TABLE accounts_supplier ADD COLUMN IF NOT EXISTS "informal_contact" BOOLEAN DEFAULT false;

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('subject', 'fra', 'Sujet', '(obje[c]?t|ref\s*:|[v,n]os\s*r[e,é]f(s?|[e,é]rence)+(\.)?|su[b]?je[c]?t|avis\s* d['',e])((\s*:\s*)|\s+)\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('subject', 'eng', 'Subject', '([o,O]bje[c]?t|[O,o,Y,y]ur\s*[r,R]ef(s?|erence)+|[s,S]u[b]?je[c]?t)\s*(:)?\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('subject_only', 'fra', 'Sujet seulement', '(obje[c]?t|su[b]?je[c]?t)((\s*:\s*)|\s+)\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('subject_only', 'eng', 'Subject only', '[o,O]bje[c]?t|[s,S]u[b]?je[c]?t\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('ref_only', 'fra', 'Réference seulement', 'ref\s*:|[v,n]os\s*r[e,é]f(s?|[e,é]rence)+(\.)?\s*.*');

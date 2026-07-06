-- 4.0.0+.sql — résiduel de reprise, à jouer APRÈS postgres/sql/4.0.0.sql.
-- Contient ce que 4.0.0.sql (montée officielle 3.6.x->4.0.0) ne couvre pas :
--   1) colonnes post-4.0.0 présentes dans structure.sql mais pas dans 4.0.0.sql ;
--   2) adaptation des chemins vers le layout conteneur /app (4.0.0.sql les a rendus
--      relatifs "./" ou laissés absolus /var/... ; ici on les fixe sur /app).
-- Paramètres psql -v : cid docs_src docs_root share_src app_custom oc_root
--   docs_src   = docservers du custom (ex. /var/docservers/opencapture/<cid>)
--   docs_root  = son parent          (ex. /var/docservers/opencapture)
--   share_src  = share source        (ex. /var/share/<cid>)
--   app_custom = /app/custom/<cid>
--   oc_root    = racine projet source (ex. /var/www/html/opencapture)

-- 1) Colonnes post-4.0.0 -----------------------------------------------------
ALTER TABLE mailcollect ADD COLUMN IF NOT EXISTS "verifier_customer_id" INTEGER;
ALTER TABLE mailcollect ADD COLUMN IF NOT EXISTS "verifier_form_id"     VARCHAR(255);

-- 2) docservers -> /app (sources absolues /var/... OU relatives "./" de 4.0.0.sql)
--    Du plus spécifique au plus générique.
UPDATE docservers SET path = REPLACE(path, :'docs_src'  || '/', '/app/docservers/');
UPDATE docservers SET path = REPLACE(path, :'docs_root' || '/', '/app/docservers/');
UPDATE docservers SET path = REPLACE(path, '/var/docservers/opencapture/', '/app/docservers/');
UPDATE docservers SET path = REPLACE(path, :'share_src' || '/', '/app/share/');
UPDATE docservers SET path = REPLACE(path, '/var/share/', '/app/share/');
UPDATE docservers SET path = REPLACE(path, :'oc_root' || '/custom/' || :'cid' || '/', :'app_custom' || '/');
UPDATE docservers SET path = REPLACE(path, :'oc_root' || '/', '/app/');
UPDATE docservers SET path = REGEXP_REPLACE(path, '^\./custom/' || :'cid' || '/', :'app_custom' || '/');
UPDATE docservers SET path = REGEXP_REPLACE(path, '^\./', '/app/');
UPDATE docservers SET path = REGEXP_REPLACE(path, '/{2,}', '/', 'g');
UPDATE docservers SET path = '/app' WHERE docserver_id = 'PROJECT_PATH';
UPDATE docservers SET path = :'app_custom' || '/data/MailCollect/' WHERE docserver_id = 'MAILCOLLECT_BATCHES';
-- SPLITTER_SHARE : absent de 4.0.0.sql, requis par le Splitter.
INSERT INTO docservers (docserver_id, path, description)
SELECT 'SPLITTER_SHARE', '/app/share/export/splitter/', '[SPLITTER] Stockage des chaines sortantes'
WHERE NOT EXISTS (SELECT 1 FROM docservers WHERE docserver_id = 'SPLITTER_SHARE');

-- 3) documents.path + attachments : chemins docservers ABSOLUS, non touchés par 4.0.0.sql
UPDATE documents   SET path = REPLACE(path, :'docs_src'  || '/', '/app/docservers/') WHERE path LIKE :'docs_src'  || '/%';
UPDATE documents   SET path = REPLACE(path, :'docs_root' || '/', '/app/docservers/') WHERE path LIKE :'docs_root' || '/%';
UPDATE documents   SET path = REGEXP_REPLACE(path, '/{2,}', '/', 'g') WHERE path LIKE '%//%';
UPDATE attachments SET path = REPLACE(path, :'docs_src'  || '/', '/app/docservers/') WHERE path LIKE :'docs_src'  || '/%';
UPDATE attachments SET path = REPLACE(path, :'docs_root' || '/', '/app/docservers/') WHERE path LIKE :'docs_root' || '/%';
UPDATE attachments SET thumbnail_path = REPLACE(thumbnail_path, :'docs_src'  || '/', '/app/docservers/') WHERE thumbnail_path LIKE :'docs_src'  || '/%';
UPDATE attachments SET thumbnail_path = REPLACE(thumbnail_path, :'docs_root' || '/', '/app/docservers/') WHERE thumbnail_path LIKE :'docs_root' || '/%';
UPDATE attachments SET path           = REGEXP_REPLACE(path, '/{2,}', '/', 'g')           WHERE path           LIKE '%//%';
UPDATE attachments SET thumbnail_path = REGEXP_REPLACE(thumbnail_path, '/{2,}', '/', 'g') WHERE thumbnail_path LIKE '%//%';

-- 4) workflows : share -> /app/share, puis input_folder nettoyé (espaces parasites, //)
UPDATE workflows SET input = REPLACE(REPLACE(input::text, :'share_src' || '/', '/app/share/'), '/var/share/', '/app/share/')::jsonb;
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(regexp_replace(btrim(input->>'input_folder'), '/{2,}', '/', 'g')))
 WHERE input ? 'input_folder' AND input->>'input_folder' IS NOT NULL;

-- 5) outputs/outputs_types : dossier de sortie -> /app/share/export/<module>/
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}', to_jsonb('/app/share/export/verifier/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'verifier';
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}', to_jsonb('/app/share/export/splitter/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'splitter';
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/verifier/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'verifier';
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/splitter/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'splitter';

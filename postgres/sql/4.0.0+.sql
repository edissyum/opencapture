-- 4.0.0+.sql — résiduel de reprise, à jouer APRÈS postgres/sql/4.0.0.sql.
-- Contient ce que 4.0.0.sql (montée officielle 3.6.x->4.0.0) ne couvre pas :
-- adaptation des chemins vers le layout conteneur /app (4.0.0.sql les a rendus
-- relatifs "./" ou laissés absolus /var/... ; ici on les fixe sur /app).
-- Paramètres psql -v : cid docs_src docs_root share_src app_custom oc_root
--   docs_src   = docservers du custom (ex. /var/docservers/opencapture/<cid>)
--   docs_root  = son parent          (ex. /var/docservers/opencapture)
--   share_src  = share source        (ex. /var/share/<cid>)
--   app_custom = /app/custom/<cid>
--   oc_root    = racine projet source (ex. /var/www/html/opencapture)

-- 1) docservers -> /app (sources absolues /var/... OU relatives "./" de 4.0.0.sql)
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
-- SPLITTER_SHARE : absent de 4.0.0.sql. Pas systématiquement présent en v3 (vérifié
-- absent sur la source edissyum/.230 : `docservers` n'a pas cette ligne, contrairement
-- à VERIFIER_SHARE) ; `docservers['SPLITTER_SHARE']` est lu en accès dict brut par
-- scripting_functions.launch_script_splitter -> KeyError si absent et qu'un workflow
-- splitter utilise le scripting custom. Garder l'insert idempotent.
INSERT INTO docservers (docserver_id, path, description)
SELECT 'SPLITTER_SHARE', '/app/share/export/splitter/', '[SPLITTER] Stockage des chaines sortantes'
WHERE NOT EXISTS (SELECT 1 FROM docservers WHERE docserver_id = 'SPLITTER_SHARE');

-- 2) documents.path + attachments : chemins docservers ABSOLUS, non touchés par 4.0.0.sql
UPDATE documents   SET path = REPLACE(path, :'docs_src'  || '/', '/app/docservers/') WHERE path LIKE :'docs_src'  || '/%';
UPDATE documents   SET path = REPLACE(path, :'docs_root' || '/', '/app/docservers/') WHERE path LIKE :'docs_root' || '/%';
UPDATE documents   SET path = REGEXP_REPLACE(path, '/{2,}', '/', 'g') WHERE path LIKE '%//%';
UPDATE attachments SET path = REPLACE(path, :'docs_src'  || '/', '/app/docservers/') WHERE path LIKE :'docs_src'  || '/%';
UPDATE attachments SET path = REPLACE(path, :'docs_root' || '/', '/app/docservers/') WHERE path LIKE :'docs_root' || '/%';
UPDATE attachments SET thumbnail_path = REPLACE(thumbnail_path, :'docs_src'  || '/', '/app/docservers/') WHERE thumbnail_path LIKE :'docs_src'  || '/%';
UPDATE attachments SET thumbnail_path = REPLACE(thumbnail_path, :'docs_root' || '/', '/app/docservers/') WHERE thumbnail_path LIKE :'docs_root' || '/%';
UPDATE attachments SET path           = REGEXP_REPLACE(path, '/{2,}', '/', 'g')           WHERE path           LIKE '%//%';
UPDATE attachments SET thumbnail_path = REGEXP_REPLACE(thumbnail_path, '/{2,}', '/', 'g') WHERE thumbnail_path LIKE '%//%';

-- 3) workflows : share -> /app/share, puis input_folder nettoyé (espaces parasites, //)
UPDATE workflows SET input = REPLACE(REPLACE(input::text, :'share_src' || '/', '/app/share/'), '/var/share/', '/app/share/')::jsonb;
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(regexp_replace(btrim(input->>'input_folder'), '/{2,}', '/', 'g')))
 WHERE input ? 'input_folder' AND input->>'input_folder' IS NOT NULL;
-- Collapse du nesting hérité v3 : certains input_folder valaient
-- /var/share/<cid>/<cid>/entrant/splitter/ ; après le rewrite /var/share->/app/share
-- il reste /app/share/<cid>/<cid>/entrant/... incompatible avec le layout conteneur
-- (/app/share/{entrant,export}/...). On supprime tout segment entre /app/share/ et
-- entrant|export. Les chemins déjà propres (/app/share/entrant/...) ne matchent pas.
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(regexp_replace(input->>'input_folder', '^/app/share/.+/(entrant|export)/', '/app/share/\1/')))
 WHERE input ? 'input_folder' AND input->>'input_folder' ~ '^/app/share/.+/(entrant|export)/';
-- Puis : un input_folder retombé sur la BASE nue (/app/share/entrant/{splitter,verifier})
-- surveillerait le parent de TOUS les sous-dossiers des autres workflows -> double
-- traitement. On le rattache au sous-dossier 'default/' (créé par le bootstrap et
-- surveillé par le template watcher.ini). Cas typique : le default_workflow splitter v3.
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(rtrim(input->>'input_folder', '/') || '/default/'))
 WHERE input->>'input_folder' ~ '^/app/share/entrant/(splitter|verifier)/?$';

-- 4) outputs/outputs_types : dossier de sortie -> /app/share/export/<module>/
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}', to_jsonb('/app/share/export/verifier/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'verifier';
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}', to_jsonb('/app/share/export/splitter/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'splitter';
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/verifier/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'verifier';
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/splitter/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'splitter';

-- 5) form_models_field : reshape metadata/champs "flat" en LIGNES -----------
--    SUPPRIMÉ (2026-07-21) : postgres/sql/4.0.0.sql (§ "Modification de la
--    structure des champs dans form_models_field") fait DÉJÀ ce reshape, pour
--    verifier ET splitter, de façon générique (toutes les sections de `fields`
--    via jsonb_each, pas juste supplier/facturation/batch_metadata/
--    document_metadata) et plus fine (regroupe par ligne selon la largeur
--    réelle des champs -- w-full/w-1/2/etc. -- pas juste "1 champ/ligne").
--    Il utilise le MÊME garde-fou (`value->0 ? 'id'`) et produit le MÊME
--    format cible {"0":champ,...,"duplicable":false}. Une version antérieure
--    de ce fichier ré-appliquait un reshape maison APRÈS celui de 4.0.0.sql,
--    avec un garde-fou plus faible (sans la clé 'id') -> ré-emballait la
--    donnée DÉJÀ correcte dans un niveau de tableau EN TROP
--    ([[{"0":...}]] au lieu de [{"0":...}]) -> `field.id.replace(...)` dans
--    frontend/src/pages/splitter/viewer.tsx sur un objet sans clé 'id' ->
--    crash pour TOUT document (vécu 2026-07-21). Idem pour la normalisation
--    `metadata_key: null -> ""` : le rebuild de 4.0.0.sql ne recopie pas cette
--    clé (jsonb_build_object avec une liste explicite de clés), donc elle
--    disparaît déjà après son passage -- rien à normaliser derrière.

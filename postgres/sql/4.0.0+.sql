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

-- 5) outputs/outputs_types : dossier de sortie -> /app/share/export/<module>/
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}', to_jsonb('/app/share/export/verifier/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'verifier';
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}', to_jsonb('/app/share/export/splitter/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'splitter';
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/verifier/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'verifier';
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/splitter/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'splitter';

-- 6) form_models_field : normaliser metadata_key null -> "" ------------------
--    En 3.6.x, les champs splitter non liés à une métadonnée portent
--    `metadata_key: null`. L'éditeur de formulaire v4 fait
--    `Object.values(field).filter(v => typeof v !== 'boolean').map(mapField)`
--    (frontend Editor.tsx) : la valeur `null` (typeof 'object') passe le filtre
--    -> `mapField(null)` lit `null.id` -> l'ouverture du formulaire crashe
--    (« Cannot read properties of null (reading 'id') »). La v3 tolérait le null.
--    `""` est la valeur « non lié » attendue par la v4. Ciblé sur metadata_key
--    (propriété de champ, jamais imbriquée) pour ne PAS toucher les null internes
--    légitimes (ex. settings.regex). À étendre ici si d'autres clés de champ
--    v3 arrivent en null au niveau supérieur.
UPDATE form_models_field
   SET fields = regexp_replace(fields::text, '"metadata_key"\s*:\s*null', '"metadata_key": ""', 'g')::jsonb
 WHERE fields::text ~ '"metadata_key"\s*:\s*null';

-- 7) form_models_field (SPLITTER) : re-emballer les champs metadata "flat" en LIGNES
--    La v3 stocke batch_metadata/document_metadata = [champ, champ] (champs à plat).
--    L'éditeur v4 attend des LIGNES : [[champ], [champ]] (il fait
--    zone.lines.map(l => l.fields.map(...)) à la sauvegarde, et Object.values(ligne)
--    au chargement -- cf. frontend Editor.tsx). Sans le niveau ligne, les zones
--    « Métadonnées du lot/document » s'affichent VIDES (et un metadata_key null exposé
--    comme valeur de ligne faisait crasher l'éditeur). On emballe chaque champ dans sa
--    propre ligne (1 champ/ligne) ; l'utilisateur peut regrouper ensuite dans l'UI.
--    Idempotent : ne touche que les zones dont les éléments sont des objets (= flat) ;
--    une zone déjà en lignes (éléments = tableaux) ou vide n'est pas retouchée.
UPDATE form_models_field ff
   SET fields = jsonb_set(ff.fields, '{batch_metadata}',
        (SELECT jsonb_agg(jsonb_build_array(e)) FROM jsonb_array_elements(ff.fields->'batch_metadata') e))
  FROM form_models fm
 WHERE fm.id = ff.form_id AND fm.module = 'splitter'
   AND jsonb_typeof((ff.fields->'batch_metadata')->0) = 'object';
UPDATE form_models_field ff
   SET fields = jsonb_set(ff.fields, '{document_metadata}',
        (SELECT jsonb_agg(jsonb_build_array(e)) FROM jsonb_array_elements(ff.fields->'document_metadata') e))
  FROM form_models fm
 WHERE fm.id = ff.form_id AND fm.module = 'splitter'
   AND jsonb_typeof((ff.fields->'document_metadata')->0) = 'object';

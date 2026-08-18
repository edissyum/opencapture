-- 4.0.0+.sql — adaptation Docker, à jouer APRÈS postgres/sql/4.0.0.sql.
-- Adapte au layout conteneur /app ce que 4.0.0.sql ne couvre pas : docservers,
-- workflows et outputs. Les chemins de documents/attachments sont relativisés
-- par 4.0.0.sql lui-même, ce fichier n'y touche plus.
-- Aucun paramètre à passer : tout est lu dans la base.
--   cid = nom du tenant CIBLE, déduit de la base opencapture_<cid>,
--         surchargeable par psql -v cid=<tenant> en cas de renommage.
--         Le nom SOURCE n'est jamais nécessaire : les remplacements le matchent en [^/]+.
--   docs_src / share_src = racines docservers et share de la source v3, lues en base
--   les racines standard (/var/docservers/opencapture/, /var/share/, /var/www/html/opencapture/)
--   sont traitées en dur juste après, pour les installations qui en sortent
-- COALESCE obligatoire : \gset sur un résultat vide laisserait les variables indéfinies.
WITH src AS (
    SELECT (SELECT rtrim(path, '/') FROM docservers WHERE docserver_id = 'DOCSERVERS_PATH')     AS docs,
           (SELECT rtrim(path, '/') FROM docservers WHERE docserver_id = 'INPUTS_ALLOWED_PATH') AS share,
           (SELECT path FROM docservers WHERE docserver_id = 'PROJECT_PATH')                    AS proj
)
SELECT regexp_replace(current_database(), '^opencapture_', '')                                  AS cid_db,
       COALESCE(docs,  '/var/docservers/opencapture')                                           AS docs_src,
       COALESCE(share, '/var/share')                                                            AS share_src,
       CASE WHEN COALESCE(proj, '') IN ('/app', '/app/') THEN 'true' ELSE 'false' END           AS already_migrated
FROM src \gset

\if :{?cid} \else \set cid :cid_db \endif
\set app_custom '/app/custom/' :cid

-- 1) docservers -> /app (sources absolues /var/... OU relatives "./" de 4.0.0.sql)
-- Ignoré si les docservers sont déjà sur /app : docs_src vaudrait alors '/app/docservers'
-- et les remplacements empileraient les préfixes.
\if :already_migrated
\echo '-- docservers deja sur /app : section 1 ignoree'
\else
UPDATE docservers SET path = REPLACE(path, :'docs_src'  || '/', '/app/docservers/');
UPDATE docservers SET path = REPLACE(path, '/var/docservers/opencapture/', '/app/docservers/');
UPDATE docservers SET path = REPLACE(path, :'share_src' || '/', '/app/share/');
UPDATE docservers SET path = REPLACE(path, '/var/share/', '/app/share/');
UPDATE docservers SET path = REPLACE(path, '/var/www/html/opencapture/', '/app/');
UPDATE docservers SET path = REGEXP_REPLACE(path, '^\./', '/app/');
UPDATE docservers SET path = REGEXP_REPLACE(path, '/{2,}', '/', 'g');
-- Renommage : une fois les chemins sur /app, le nom du custom est remplacé quel qu'il soit.
-- Pas besoin de connaître le nom source : [^/]+ le matche, on écrit le nom cible.
UPDATE docservers SET path = REGEXP_REPLACE(path, '^/app/custom/[^/]+/', :'app_custom' || '/');
UPDATE docservers SET path = '/app' WHERE docserver_id = 'PROJECT_PATH';
UPDATE docservers SET path = :'app_custom' || '/data/MailCollect/' WHERE docserver_id = 'MAILCOLLECT_BATCHES';
\endif

-- 2) SPLITTER_SHARE : absent des bases v3 antérieures à son ajout dans data_fr.sql,
-- et aucune migration v3 ne le rattrape. scripting_functions.launch_script_splitter
-- y accède en dict brut -> KeyError sur un workflow splitter à script custom.
INSERT INTO docservers (docserver_id, path, description)
SELECT 'SPLITTER_SHARE', '/app/share/export/splitter/', '[SPLITTER] Stockage des chaines sortantes'
WHERE NOT EXISTS (SELECT 1 FROM docservers WHERE docserver_id = 'SPLITTER_SHARE');

-- 3) workflows : share -> /app/share, puis input_folder nettoyé (espaces parasites, //)
UPDATE workflows SET input = REPLACE(REPLACE(input::text, :'share_src' || '/', '/app/share/'), '/var/share/', '/app/share/')::jsonb;
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(regexp_replace(btrim(input->>'input_folder'), '/{2,}', '/', 'g')))
 WHERE input ? 'input_folder' AND input->>'input_folder' IS NOT NULL;
-- ATTENTION : certains input_folder valaient /var/share/<cid>/<cid>/entrant/splitter/ on réécrit ainsi /var/share->/app/share
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(regexp_replace(input->>'input_folder', '^/app/share/.+/(entrant|export)/', '/app/share/\1/')))
 WHERE input ? 'input_folder' AND input->>'input_folder' ~ '^/app/share/.+/(entrant|export)/';
-- ATTENTION : un input_folder sur (/app/share/entrant/{splitter,verifier}) -- surveillerait le parent de TOUS les sous-dossiers des autres workflows 
-- ce qui ferait un double traitement : on le positionne sur '/default/'.
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(rtrim(input->>'input_folder', '/') || '/default/'))
 WHERE input->>'input_folder' ~ '^/app/share/entrant/(splitter|verifier)/?$';

-- 4) outputs : on remplace seulement le DÉBUT du chemin, jamais la valeur entière.
-- Le dossier de sortie est un choix métier : une sortie splitter peut viser l'entrant
-- du verifier, ou un dossier surveillé par une autre application.
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}',
        to_jsonb(REPLACE(REPLACE(data #>>'{options,parameters,0,value}', :'share_src' || '/', '/app/share/'),
                         '/var/share/', '/app/share/')))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out'
   AND data #>>'{options,parameters,0,value}' IS NOT NULL;
-- Supprime le dossier en trop hérité de la v3 : /app/share/<cid>/entrant/ -> /app/share/entrant/
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}',
        to_jsonb(regexp_replace(data #>>'{options,parameters,0,value}', '^/app/share/.+/(entrant|export)/', '/app/share/\1/')))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out'
   AND data #>>'{options,parameters,0,value}' ~ '^/app/share/.+/(entrant|export)/';

-- outputs_types : simple placeholder d'interface, aucune donnée métier.
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/verifier/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'verifier';
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/splitter/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'splitter';


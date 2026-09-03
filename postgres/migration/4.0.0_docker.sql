-- 4.0.0_docker.sql — adaptation Docker, à jouer APRÈS postgres/sql/4.0.0.sql.
-- Adapte les docservers, workflows et outputs au layout conteneur /app.
-- Aucun paramètre : tout est lu en base. Le renommage d'un custom est traité
-- par migrate.sh, qui seul connaît le nom cible.
SELECT COALESCE((SELECT rtrim(path, '/') FROM docservers WHERE docserver_id = 'DOCSERVERS_PATH'),
                '/var/docservers/opencapture')                                                   AS docs_src,
       COALESCE((SELECT rtrim(path, '/') FROM docservers WHERE docserver_id = 'SHARE_PATH'),
                (SELECT rtrim(path, '/') FROM docservers WHERE docserver_id = 'INPUTS_ALLOWED_PATH'),
                '/var/share')                                                                    AS share_src,
       COALESCE((SELECT substring(path from '/custom/([^/]+)/') FROM docservers
                  WHERE docserver_id = 'REFERENTIALS_PATH'),
                regexp_replace(current_database(), '^opencapture_', ''))                         AS cid_src,
       CASE WHEN COALESCE((SELECT path FROM docservers WHERE docserver_id = 'PROJECT_PATH'), '')
                 IN ('/app', '/app/') THEN 'true' ELSE 'false' END                               AS already_migrated
\gset

-- 1) docservers -> /app. Ignoré si déjà fait : docs_src vaudrait '/app/docservers'
-- et les remplacements empileraient les préfixes.
\if :already_migrated
\echo '-- docservers deja sur /app : section 1 ignoree'
\else
UPDATE docservers SET path = REPLACE(path, :'docs_src'  || '/', '/app/docservers/');
UPDATE docservers SET path = REPLACE(path, '/var/docservers/opencapture/', '/app/docservers/');
UPDATE docservers SET path = REPLACE(path, :'share_src' || '/', '/app/share/');
UPDATE docservers SET path = REPLACE(path, '/var/share/', '/app/share/');
UPDATE docservers SET path = REPLACE(path, '/var/www/html/opencapture/', '/app/');
-- Chemins du custom avant la règle générique (cf. docker-bootstrap.sh:314-315) :
-- sinon './data/MailCollect/' finit en '/app/data/', monté par aucun volume.
UPDATE docservers SET path = REPLACE(path, './data/',     '/app/custom/' || :'cid_src' || '/data/');
UPDATE docservers SET path = REPLACE(path, './instance/', '/app/custom/' || :'cid_src' || '/instance/');
UPDATE docservers SET path = REGEXP_REPLACE(path, '^\./', '/app/');
UPDATE docservers SET path = REGEXP_REPLACE(path, '/{2,}', '/', 'g');
UPDATE docservers SET path = '/app' WHERE docserver_id = 'PROJECT_PATH';
\endif

-- 2) workflows : share -> /app/share, puis input_folder nettoyé
UPDATE workflows SET input = REPLACE(REPLACE(input::text, :'share_src' || '/', '/app/share/'), '/var/share/', '/app/share/')::jsonb;
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(regexp_replace(btrim(input->>'input_folder'), '/{2,}', '/', 'g')))
 WHERE input ? 'input_folder' AND input->>'input_folder' IS NOT NULL;
-- Dossier en trop hérité de la v3 : /app/share/<cid>/entrant/ -> /app/share/entrant/
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(regexp_replace(input->>'input_folder', '^/app/share/.+/(entrant|export)/', '/app/share/\1/')))
 WHERE input ? 'input_folder' AND input->>'input_folder' ~ '^/app/share/.+/(entrant|export)/';
-- Un input_folder sur la base nue surveillerait les dossiers des autres workflows
-- (double traitement) : on le rattache à 'default/'.
UPDATE workflows SET input = jsonb_set(input, '{input_folder}',
        to_jsonb(rtrim(input->>'input_folder', '/') || '/default/'))
 WHERE input->>'input_folder' ~ '^/app/share/entrant/(splitter|verifier)/?$';

-- 3) outputs : on remplace le DÉBUT du chemin, jamais la valeur entière — le dossier
-- de sortie est un choix métier (entrant du verifier, dossier d'une autre appli...).
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}',
        to_jsonb(REPLACE(REPLACE(data #>>'{options,parameters,0,value}', :'share_src' || '/', '/app/share/'),
                         '/var/share/', '/app/share/')))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out'
   AND data #>>'{options,parameters,0,value}' IS NOT NULL;
-- Même dossier en trop que pour les workflows.
UPDATE outputs SET data = jsonb_set(data, '{options,parameters,0,value}',
        to_jsonb(regexp_replace(data #>>'{options,parameters,0,value}', '^/app/share/.+/(entrant|export)/', '/app/share/\1/')))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out'
   AND data #>>'{options,parameters,0,value}' ~ '^/app/share/.+/(entrant|export)/';

-- outputs_types : placeholder d'interface, aucune donnée métier.
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/verifier/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'verifier';
UPDATE outputs_types SET data = jsonb_set(data, '{options,parameters,0,placeholder}', to_jsonb('/app/share/export/splitter/'::text))
 WHERE data #>>'{options,parameters,0,id}' = 'folder_out' AND module = 'splitter';


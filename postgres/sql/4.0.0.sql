-- Récupération de l'ancien chemin du projet pour le stocker dans une variable
SELECT path as old_path FROM docservers WHERE docserver_id = 'PROJECT_PATH'; \gset

-- Remplacer les chemins dans les docservers
UPDATE docservers SET path = REPLACE(path, :'old_path', './');

-- Supprimer les privilèges obsolètes
DELETE FROM privileges WHERE label = 'update_login_bottom_message';

-- Suppression des chemins obsolètes
DELETE FROM docservers WHERE docserver_id = 'TMP_PATH';
DELETE FROM docservers WHERE docserver_id = 'ERROR_PATH';
DELETE FROM docservers WHERE docserver_id = 'LOCALE_PATH';
DELETE FROM docservers WHERE docserver_id = 'ASSETS_PATH';
DELETE FROM docservers WHERE docserver_id = 'CONFIG_PATH';
DELETE FROM docservers WHERE docserver_id = 'SCRIPTS_PATH';
DELETE FROM docservers WHERE docserver_id = 'SEPARATOR_QR_TMP';
DELETE FROM docservers WHERE docserver_id = 'SEPARATOR_OUTPUT_PDF';
DELETE FROM docservers WHERE docserver_id = 'SEPARATOR_OUTPUT_PDFA';
DELETE FROM docservers WHERE docserver_id = 'SPLITTER_METHODS_PATH';
DELETE FROM docservers WHERE docserver_id = 'SPLITTER_METADATA_PATH';

-- Suppression de la colonne enabled
ALTER TABLE roles DROP COLUMN enabled;

-- Mise à jour des libellés de la configuration
UPDATE configurations set label = 'loginMessage' WHERE label = 'loginTopMessage';

-- Suppression des paramètres obsolètes
DELETE FROM configurations WHERE label = 'timeoutUpload';
DELETE FROM configurations WHERE label = 'loginBottomMessage';

-- Ajout de la nouvelle table gérant les paramètres favoris
CREATE TABLE settings_favorites
(
    "id"      SERIAL UNIQUE PRIMARY KEY,
    "user_id" INTEGER,
    "route"   VARCHAR(255)
);

-- Ajout de la colonne original_filename dans les batchs du Splitter
ALTER TABLE splitter_batches ADD COLUMN original_filename VARCHAR(255);

-- Modification de la taille de la colonne provider dans la table ai_llm
ALTER TABLE ai_llm ALTER COLUMN provider TYPE VARCHAR(50);

-- Modification de la taille de la colonne label_short dans la table ai_llm
ALTER TABLE roles ALTER COLUMN label_short TYPE VARCHAR(255);

-- Remplacement des couleurs pour utiliser des codes hexadécimaux
UPDATE form_models_field
SET fields = jsonb_set(
    fields,
    '{supplier}',
    (SELECT jsonb_agg(
        CASE
            WHEN f ->> 'color' = 'yellow' THEN jsonb_set(f, '{color}', '"#B3A613"'::jsonb)
            WHEN f ->> 'color' = 'pink' THEN jsonb_set(f, '{color}', '"#F469F6"'::jsonb)
            WHEN f ->> 'color' = 'red' THEN jsonb_set(f, '{color}', '"#CD0D0D"'::jsonb)
            WHEN f ->> 'color' = 'olive' THEN jsonb_set(f, '{color}', '"#19864B"'::jsonb)
            WHEN f ->> 'color' = 'orange' THEN jsonb_set(f, '{color}', '"#E66910"'::jsonb)
            WHEN f ->> 'color' = 'purple' THEN jsonb_set(f, '{color}', '"#57076B"'::jsonb)
            WHEN f ->> 'color' = 'blue' THEN jsonb_set(f, '{color}', '"#426CF5"'::jsonb)
            WHEN f ->> 'color' = 'black' THEN jsonb_set(f, '{color}', '"#000000"'::jsonb)
            WHEN f ->> 'color' = 'white' THEN jsonb_set(f, '{color}', '"#11603D"'::jsonb)
            WHEN f ->> 'color' = 'aqua' THEN jsonb_set(f, '{color}', '"#1CC7BE"'::jsonb)
            WHEN f ->> 'color' = 'maroon' THEN jsonb_set(f, '{color}', '"#974600"'::jsonb)
            WHEN f ->> 'color' = 'teal' THEN jsonb_set(f, '{color}', '"#178984"'::jsonb)
            WHEN f ->> 'color' = 'fuchsia' THEN jsonb_set(f, '{color}', '"#E600E6"'::jsonb)
            WHEN f ->> 'color' = 'silver' THEN jsonb_set(f, '{color}', '"#6E6E6E"'::jsonb)
            WHEN f ->> 'color' = 'gray' THEN jsonb_set(f, '{color}', '"#6E6E6E"'::jsonb)
            WHEN f ->> 'color' = 'lime' THEN jsonb_set(f, '{color}', '"#19864B"'::jsonb)
            WHEN f ->> 'color' = 'green' THEN jsonb_set(f, '{color}', '"#11603D"'::jsonb)
            ELSE f
        END
    )
    FROM jsonb_array_elements(fields -> 'supplier') AS s(f))
) WHERE form_id IN (SELECT id FROM form_models WHERE module = 'verifier');

UPDATE form_models_field
SET fields = jsonb_set(
    fields,
    '{facturation}',
    (SELECT jsonb_agg(
        CASE
            WHEN f ->> 'color' = 'yellow' THEN jsonb_set(f, '{color}', '"#B3A613"'::jsonb)
            WHEN f ->> 'color' = 'pink' THEN jsonb_set(f, '{color}', '"#F469F6"'::jsonb)
            WHEN f ->> 'color' = 'red' THEN jsonb_set(f, '{color}', '"#CD0D0D"'::jsonb)
            WHEN f ->> 'color' = 'olive' THEN jsonb_set(f, '{color}', '"#19864B"'::jsonb)
            WHEN f ->> 'color' = 'orange' THEN jsonb_set(f, '{color}', '"#E66910"'::jsonb)
            WHEN f ->> 'color' = 'purple' THEN jsonb_set(f, '{color}', '"#57076B"'::jsonb)
            WHEN f ->> 'color' = 'blue' THEN jsonb_set(f, '{color}', '"#426CF5"'::jsonb)
            WHEN f ->> 'color' = 'black' THEN jsonb_set(f, '{color}', '"#000000"'::jsonb)
            WHEN f ->> 'color' = 'white' THEN jsonb_set(f, '{color}', '"#11603D"'::jsonb)
            WHEN f ->> 'color' = 'aqua' THEN jsonb_set(f, '{color}', '"#1CC7BE"'::jsonb)
            WHEN f ->> 'color' = 'maroon' THEN jsonb_set(f, '{color}', '"#974600"'::jsonb)
            WHEN f ->> 'color' = 'teal' THEN jsonb_set(f, '{color}', '"#178984"'::jsonb)
            WHEN f ->> 'color' = 'fuchsia' THEN jsonb_set(f, '{color}', '"#E600E6"'::jsonb)
            WHEN f ->> 'color' = 'silver' THEN jsonb_set(f, '{color}', '"#6E6E6E"'::jsonb)
            WHEN f ->> 'color' = 'gray' THEN jsonb_set(f, '{color}', '"#6E6E6E"'::jsonb)
            WHEN f ->> 'color' = 'lime' THEN jsonb_set(f, '{color}', '"#19864B"'::jsonb)
            WHEN f ->> 'color' = 'green' THEN jsonb_set(f, '{color}', '"#11603D"'::jsonb)
            ELSE f
        END
    )
    FROM jsonb_array_elements(fields -> 'facturation') AS s(f))
) WHERE form_id IN (SELECT id FROM form_models WHERE module = 'verifier');

-- Modification des imports par défaut du scripting des workflows
UPDATE workflows
SET input   = REPLACE(input::text, 'src.backend', 'src')::jsonb,
    output  = REPLACE(output::text, 'src.backend', 'src')::jsonb,
    process = REPLACE(process::text, 'src.backend', 'src')::jsonb
WHERE input::text LIKE '%src.backend%'
   OR output::text LIKE '%src.backend%'
   OR process::text LIKE '%src.backend%';

-- Modification de la structure des champs dans form_models_field
-- Désormais on souhaite que chaque valeur de tableau soit encapsulée dans un tableau supplémentaire
-- Chaque tableau est considéré comme une ligne

-- Formulaires Verifier
WITH RECURSIVE base AS (
    SELECT
        fmf.id,
        key AS section,
        value AS arr
    FROM form_models_field fmf CROSS JOIN LATERAL jsonb_each(fmf.fields) LEFT JOIN form_models fm ON fm.id = fmf.form_id
    WHERE jsonb_typeof(value) = 'array'
      AND fm.module = 'verifier'
      AND jsonb_array_length(value) > 0
      AND jsonb_typeof(value->0) = 'object'
      AND value->0 ? 'id'
),
    exploded AS (
       SELECT
           b.id,
           b.section,
           e.ordinality - 1 AS pos,
           e.value AS field,
           CASE e.value->>'class'
               WHEN 'w-full' THEN 60
               WHEN 'w-1/2' THEN 30
               WHEN 'w-1/3' THEN 20
               WHEN 'w-1/4' THEN 15
               WHEN 'w-1/5' THEN 12
               WHEN 'w-1/6' THEN 10
               ELSE 60
               END AS width
       FROM base b CROSS JOIN LATERAL jsonb_array_elements(b.arr)
           WITH ORDINALITY AS e(value, ordinality)
    ),
    running AS (
       SELECT *,
              SUM(width) OVER (
                  PARTITION BY id, section
                  ORDER BY pos
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                  ) AS running_sum
       FROM exploded
    ),
    grouped AS (
       SELECT *, ((running_sum - 1) / 60)::int AS line_id
       FROM running
    ),
    numbered AS (
       SELECT *,
              ROW_NUMBER() OVER (
                  PARTITION BY id, section, line_id
                  ORDER BY pos
                  ) - 1 AS col
       FROM grouped
    ),
    built AS (
       SELECT
           id,
           section,
           line_id,
           jsonb_build_object(
               col::text,
               jsonb_build_object(
                   'id', field->>'id',
                   'type', field->>'type',
                   'label', field->>'label',
                   'color', field->>'color',
                   'format', field->>'format',
                   'default_value', COALESCE(field->>'default_value', ''),
                   'required', COALESCE((field->>'required')::boolean, false)
               )
           ) AS obj
       FROM numbered
    ),
    merged AS (
       SELECT
           id,
           section,
           line_id,
           jsonb_object_agg(k, v) || '{"duplicable": false}'::jsonb AS line
       FROM (
                SELECT
                    id,
                    section,
                    line_id,
                    key AS k,
                    value AS v
                FROM built,
                    LATERAL jsonb_each(obj)
            ) s
       GROUP BY id, section, line_id
    ),
    rebuilt AS (
       SELECT
           id,
           section,
           jsonb_agg(line ORDER BY line_id) AS new_array
       FROM merged
       GROUP BY id, section
    ),
    final AS (
       SELECT
           id,
           jsonb_object_agg(section, new_array) AS new_fields
       FROM rebuilt
       GROUP BY id
    )
UPDATE form_models_field fmf
SET fields = f.new_fields
FROM final f
WHERE f.id = fmf.id;

-- Formulaires Splitter
WITH RECURSIVE base AS (
    SELECT
        fmf.id,
        key AS section,
        value AS arr
    FROM form_models_field fmf CROSS JOIN LATERAL jsonb_each(fmf.fields) LEFT JOIN form_models fm ON fm.id = fmf.form_id
    WHERE jsonb_typeof(value) = 'array'
      AND fm.module = 'splitter'
      AND jsonb_array_length(value) > 0
      AND jsonb_typeof(value->0) = 'object'
      AND value->0 ? 'id'
),
    exploded AS (
       SELECT
           b.id,
           b.section,
           e.ordinality - 1 AS pos,
           e.value AS field,
           CASE e.value->>'class'
               WHEN 'w-full' THEN 60
               WHEN 'w-1/2' THEN 30
               WHEN 'w-1/3' THEN 20
               WHEN 'w-1/4' THEN 15
               WHEN 'w-1/5' THEN 12
               WHEN 'w-1/6' THEN 10
               ELSE 60
           END AS width
       FROM base b CROSS JOIN LATERAL jsonb_array_elements(b.arr)
           WITH ORDINALITY AS e(value, ordinality)
    ),
    running AS (
       SELECT *,
              SUM(width) OVER (
                  PARTITION BY id, section
                  ORDER BY pos
                  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                  ) AS running_sum
       FROM exploded
    ),
    grouped AS (
       SELECT *, ((running_sum - 1) / 60)::int AS line_id
       FROM running
    ),
    numbered AS (
       SELECT *,
              ROW_NUMBER() OVER (
                  PARTITION BY id, section, line_id
                  ORDER BY pos
                  ) - 1 AS col
       FROM grouped
    ),
    built AS (
       SELECT
           id,
           section,
           line_id,
           jsonb_build_object(
               col::text,
               jsonb_build_object(
                   'id', field->>'id',
                   'type', field->>'type',
                   'label', field->>'label',
                   'format', field->>'format',
                   'result_mask', field->>'result_mask',
                   'search_mask', field->>'search_mask',
                   'field_metadata', field->'field_metadata',
                   'validation_mask', field->>'validation_mask',
                   'default_value', COALESCE(field->>'default_value', ''),
                   'required', COALESCE((field->>'required')::boolean, false),
                   'disabled', COALESCE((field->>'disabled')::boolean, false)
               )
           ) AS obj
       FROM numbered
    ),
    merged AS (
       SELECT
           id,
           section,
           line_id,
           jsonb_object_agg(k, v) || '{"duplicable": false}'::jsonb AS line
       FROM (
                SELECT
                    id,
                    section,
                    line_id,
                    key AS k,
                    value AS v
                FROM built,
                    LATERAL jsonb_each(obj)
            ) s
       GROUP BY id, section, line_id
    ),
    rebuilt AS (
       SELECT
           id,
           section,
           jsonb_agg(line ORDER BY line_id) AS new_array
       FROM merged
       GROUP BY id, section
    ),
    final AS (
       SELECT
           id,
           jsonb_object_agg(section, new_array) AS new_fields
       FROM rebuilt
       GROUP BY id
    )
UPDATE form_models_field fmf
SET fields = f.new_fields
FROM final f
WHERE f.id = fmf.id;

-- Modification des libellés
UPDATE form_models_field
SET fields = REPLACE(fields::text, 'ADDRESSES.address_1', 'ACCOUNTS.address1')::jsonb
WHERE fields::text LIKE '%ADDRESSES.address_1%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'ADDRESSES.address_2', 'ACCOUNTS.address2')::jsonb
WHERE fields::text LIKE '%ADDRESSES.address_2%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'ADDRESSES.postal_code', 'ACCOUNTS.postal_code')::jsonb
WHERE fields::text LIKE '%ADDRESSES.postal_code%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'ADDRESSES.city', 'ACCOUNTS.city')::jsonb
WHERE fields::text LIKE '%ADDRESSES.city%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'ADDRESSES.country', 'ACCOUNTS.country')::jsonb
WHERE fields::text LIKE '%ADDRESSES.country%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.document_date', 'VERIFIER.document_date')::jsonb
WHERE fields::text LIKE '%FACTURATION.document_date%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.document_due_date', 'VERIFIER.document_due_date')::jsonb
WHERE fields::text LIKE '%FACTURATION.document_due_date%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.vat_rate', 'VERIFIER.vat_rate')::jsonb
WHERE fields::text LIKE '%FACTURATION.vat_rate%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.total_ht', 'VERIFIER.total_ht')::jsonb
WHERE fields::text LIKE '%FACTURATION.total_ht%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.total_ttc', 'VERIFIER.total_ttc')::jsonb
WHERE fields::text LIKE '%FACTURATION.total_ttc%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.vat_amount', 'VERIFIER.vat_amount')::jsonb
WHERE fields::text LIKE '%FACTURATION.vat_amount%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.no_rate_amount', 'VERIFIER.no_rate_amount')::jsonb
WHERE fields::text LIKE '%FACTURATION.no_rate_amount%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.total_vat', 'VERIFIER.total_vat')::jsonb
WHERE fields::text LIKE '%FACTURATION.total_vat%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.invoice_number', 'VERIFIER.invoice_number')::jsonb
WHERE fields::text LIKE '%FACTURATION.invoice_number%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.quotation_number', 'VERIFIER.quotation_number')::jsonb
WHERE fields::text LIKE '%FACTURATION.quotation_number%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.order_number', 'VERIFIER.order_number')::jsonb
WHERE fields::text LIKE '%FACTURATION.order_number%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.delivery_number', 'VERIFIER.delivery_number')::jsonb
WHERE fields::text LIKE '%FACTURATION.delivery_number%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.lastname', 'ACCOUNTS.lastname')::jsonb
WHERE fields::text LIKE '%FACTURATION.lastname%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.firstname', 'ACCOUNTS.firstname')::jsonb
WHERE fields::text LIKE '%FACTURATION.firstname%';

UPDATE form_models_field
SET fields = REPLACE(fields::text, 'FACTURATION.accounting_plan', 'VERIFIER.accounting_plan')::jsonb
WHERE fields::text LIKE '%FACTURATION.accounting_plan%';

-- Suppression de la colonne enabled des custom_fields
ALTER TABLE custom_fields
    DROP COLUMN enabled;

-- Ajout de l'océrisation des PJ dans le MailCollect
ALTER TABLE mailcollect
    ADD COLUMN ocr_attachments BOOLEAN DEFAULT false;

-- Replace doctypes code to use - instead of .
UPDATE doctypes
SET code = REPLACE(code, '.', '-')
WHERE code LIKE '%.%';

-- Rajout d'une balise active pour les documents pour les modèles de detection de types de documents
UPDATE ai_models
SET documents = (SELECT jsonb_agg(elem || '{
    "active": true
}'::jsonb)
                 FROM jsonb_array_elements(documents) AS elem)
WHERE documents IS NOT NULL
  AND jsonb_typeof(documents) = 'array';

-- Mettre à jour l'identifiant de compression pour les chaînes sortantes
ALTER TABLE outputs
    ALTER COLUMN compress_type SET DATA TYPE VARCHAR(12);

UPDATE outputs
SET compress_type = 'no_compress'
WHERE compress_type IN ('', NULL)
  AND output_type_id IN ('export_pdf', 'export_cmis', 'export_openads');

-- Modification des paramètres de la chaine sortante MEM Courrier
UPDATE outputs_types
SET data = jsonb_set(
        data,
        '{options,parameters}',
        (SELECT jsonb_agg(
                        CASE
                            WHEN elem ->> 'id' = 'subject'
                                THEN elem || '{
                                "type": "text"
                            }'::jsonb
                            ELSE elem
                            END
                )
         FROM jsonb_array_elements(data -> 'options' -> 'parameters') elem)
           )
WHERE data -> 'options' -> 'parameters' @> '[{"id": "subject"}]'
  AND output_type_id = 'export_mem';

UPDATE outputs
SET data = jsonb_set(
        data,
        '{options,parameters}',
        (SELECT jsonb_agg(
                        CASE
                            WHEN elem ->> 'id' = 'subject'
                                THEN elem || '{
                                "type": "text"
                            }'::jsonb
                            ELSE elem
                            END
                )
         FROM jsonb_array_elements(data -> 'options' -> 'parameters') elem)
           )
WHERE data -> 'options' -> 'parameters' @> '[{"id": "subject"}]'
  AND output_type_id = 'export_mem';

UPDATE outputs
SET data = jsonb_set(
        data,
        '{options,parameters}',
        (SELECT jsonb_agg(
                        CASE
                            WHEN elem ? 'webservice'
                                AND elem ->> 'webservice' <> ''
                                AND jsonb_typeof(elem -> 'value') = 'object'
                                THEN
                                elem || jsonb_build_object(
                                        'value',
                                        jsonb_build_object(
                                                'id', elem -> 'value' -> 'id',
                                                'label', elem -> 'value' ->> 'value'
                                        )
                                        )
                            ELSE
                                elem
                            END
                )
         FROM jsonb_array_elements(data -> 'options' -> 'parameters') elem)
           )
WHERE output_type_id = 'export_mem';

UPDATE outputs
SET data = jsonb_set(
        data,
        '{options,links}',
        (SELECT jsonb_agg(
                        CASE
                            WHEN elem ? 'webservice'
                                AND elem ->> 'webservice' <> ''
                                AND jsonb_typeof(elem -> 'value') = 'object'
                                THEN
                                elem || jsonb_build_object(
                                        'value',
                                        jsonb_build_object(
                                                'id', elem -> 'value' -> 'id',
                                                'label', elem -> 'value' ->> 'value'
                                        )
                                        )
                            ELSE
                                elem
                            END
                )
         FROM jsonb_array_elements(data -> 'options' -> 'links') elem)
           )
WHERE output_type_id = 'export_mem';

-- Add SHA256 hash of the document content in the documents table
ALTER TABLE documents ADD COLUMN "sha256" VARCHAR(64);
ALTER TABLE splitter_batches ADD COLUMN "sha256" VARCHAR(64);

ALTER TABLE splitter_documents ADD COLUMN "md5" VARCHAR(32);
ALTER TABLE splitter_documents ADD COLUMN "sha256" VARCHAR(64);

-- Modifier document_md5 en md5 dans les chaînes sortants XML Splitter
UPDATE outputs
SET data = jsonb_set(
    data,
    '{options,parameters}',
    (SELECT jsonb_agg(
        CASE
        WHEN param ->> 'id' = 'xml_template' THEN
            jsonb_set(
                param,
                '{value}',
                to_jsonb(
                    replace(param ->> 'value', '#document_md5#', '#md5#')
                )
            )
            ELSE param
        END
    )
    FROM jsonb_array_elements(data -> 'options' -> 'parameters') AS param)
)
WHERE output_type_id = 'export_xml' AND module = 'splitter';

-- Ajout d'un privilèges pour la copie conforme
INSERT INTO "privileges" ("label", "parent") VALUES ('certified_copy', 'splitter');

-- Utiliser l'id technique pour le workflow dans la table monitoring au lieu du workflow_id
UPDATE monitoring m SET workflow_id = w.id FROM workflows w WHERE m.workflow_id = w.workflow_id AND m.module = w.module;
UPDATE monitoring SET workflow_id = NULL WHERE workflow_id !~ '^\d+$';

ALTER TABLE monitoring ALTER COLUMN workflow_id TYPE INTEGER USING workflow_id::integer;

-- Utiliser l'id technique pour le workflow dans la table history au lieu du workflow_id
UPDATE history h SET workflow_id = w.id FROM workflows w WHERE h.workflow_id = w.workflow_id AND h.history_module = w.module;
UPDATE history SET workflow_id = NULL WHERE workflow_id !~ '^\d+$';

ALTER TABLE history ALTER COLUMN workflow_id TYPE INTEGER USING workflow_id::integer;

-- Utiliser l'id technique du workflows pour les process mails
ALTER TABLE mailcollect ADD column workflow_id INTEGER DEFAULT NULL;

UPDATE mailcollect m SET workflow_id = w.id FROM workflows w WHERE is_splitter = True AND m.splitter_workflow_id = w.workflow_id AND w.module = 'splitter';
UPDATE mailcollect m SET workflow_id = w.id FROM workflows w WHERE is_splitter = False AND m.verifier_workflow_id = w.workflow_id AND w.module = 'verifier';

ALTER TABLE mailcollect DROP COLUMN splitter_workflow_id;
ALTER TABLE mailcollect DROP COLUMN verifier_workflow_id;

-- Migration des chaînes sortants de type MEM

UPDATE outputs
SET data = jsonb_set(
    jsonb_set(
        data,
        '{options,links}',
        (
            SELECT jsonb_agg(
                CASE
                    WHEN elem->>'webservice' IS NOT NULL
                        AND elem->>'webservice' <> ''
                        AND elem->'value' IS NOT NULL
                        AND elem->'value' <> 'null'::jsonb
                        AND jsonb_typeof(elem->'value') = 'object'
                        THEN jsonb_set(elem, '{value}', to_jsonb(elem->'value'->>'id'))
                    ELSE elem
                END
            ) FROM jsonb_array_elements(data->'options'->'links') elem
        )),
        '{options,parameters}',
        (
            SELECT jsonb_agg(
                CASE
                    WHEN elem->>'webservice' IS NOT NULL
                        AND elem->>'webservice' <> ''
                        AND elem->'value' IS NOT NULL
                        AND elem->'value' <> 'null'::jsonb
                        AND jsonb_typeof(elem->'value') = 'object'
                        THEN jsonb_set(elem, '{value}', to_jsonb(elem->'value'->>'id'))
                    ELSE elem
                END
            ) FROM jsonb_array_elements(data->'options'->'parameters') elem
        )
)
WHERE output_type_id = 'export_mem';

-- Ajout d'une configuration pour selectionner le dtype de la recherche IA du contact informel
INSERT INTO "configurations" ("label", "data") VALUES ('informalContactDtype', '{"type": "list", "value": "bfloat16", "options": ["float32", "bfloat16"], "description": "Définit le niveau de précision du modèle. bfloat16 (rapide et économe) ou float32 (précis et compatible)"}');

-- Modification de la table documents pour supprimer les chemins absolus
UPDATE documents d
SET path = REGEXP_REPLACE(REPLACE(d.path, ds.path, ''), '^/+', '')
FROM docservers ds
WHERE ds.docserver_id = 'VERIFIER_ORIGINAL_DOC';

-- Modification de la table attachments pour supprimer les chemins absolus
UPDATE attachments a
SET path = REGEXP_REPLACE(REPLACE(a.path, ds.path, ''), '^/+', '')
FROM docservers ds
WHERE ds.docserver_id = 'VERIFIER_ATTACHMENTS' AND a.document_id is not NULL AND a.path LIKE '%' || ds.path || '%';

UPDATE attachments a
SET thumbnail_path = REGEXP_REPLACE(REPLACE(a.thumbnail_path, ds.path, ''), '^/+', '')
FROM docservers ds
WHERE ds.docserver_id = 'VERIFIER_THUMB' AND a.document_id is not NULL;

UPDATE attachments a
SET path = REGEXP_REPLACE(REPLACE(a.path, ds.path, ''), '^/+', '')
FROM docservers ds
WHERE ds.docserver_id = 'SPLITTER_ATTACHMENTS' AND a.batch_id is not NULL AND a.path LIKE '%' || ds.path || '%';

UPDATE attachments a
SET thumbnail_path = REGEXP_REPLACE(REPLACE(a.thumbnail_path, ds.path, ''), '^/+', '')
FROM docservers ds
WHERE ds.docserver_id = 'SPLITTER_THUMB' AND a.batch_id is not NULL;

-- Ajout de la possibilité de stocker l'expéditeur, le destinataire et les copies lors de la capture MailCollect
ALTER TABLE mailcollect ADD COLUMN "copy_custom_id" INTEGER DEFAULT NULL;
ALTER TABLE mailcollect ADD COLUMN "sender_custom_id" INTEGER DEFAULT NULL;
ALTER TABLE mailcollect ADD COLUMN "recipient_custom_id" INTEGER DEFAULT NULL;
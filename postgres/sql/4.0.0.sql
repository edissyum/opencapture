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
DELETE FROM configurations WHERE label = 'loginBottomMessage';
UPDATE configurations set label = 'loginMessage' WHERE label = 'loginTopMessage';

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
);

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
);

-- Modification des imports par défaut du scripting des workflows
UPDATE workflows
SET input   = REPLACE(input::text, 'src.backend', 'src')::jsonb,
    process = REPLACE(process::text, 'src.backend', 'src')::jsonb,
    output  = REPLACE(output::text, 'src.backend', 'src')::jsonb
WHERE input::text LIKE '%src.backend%'
   OR process::text LIKE '%src.backend%'
   OR output::text LIKE '%src.backend%';

-- Modification de la structure des champs dans form_models_field
-- Désormais on souhaite que chaque valeur de tableau soit encapsulée dans un tableau supplémentaire
-- Chaque tableau est considéré comme une ligne
UPDATE form_models_field
SET fields = (SELECT jsonb_object_agg(
     key,
     CASE
         WHEN jsonb_typeof(value) = 'array' THEN
             COALESCE(
                 (SELECT jsonb_agg(jsonb_build_array(elem)) FROM jsonb_array_elements(value) AS t(elem)),
                 '[]'::jsonb
             )
         ELSE
             value
         END
)
FROM jsonb_each(fields)) WHERE jsonb_typeof(fields) = 'object' AND form_id IN (SELECT id FROM form_models WHERE module = 'verifier');

UPDATE form_models_field
SET fields = jsonb_set(
    jsonb_set(
        fields,
        '{batch_metadata}',
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_array(elem)) FROM jsonb_array_elements(fields -> 'batch_metadata') AS elem),
            '[]'::jsonb
        )
    ),
    '{document_metadata}',
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_array(elem)) FROM jsonb_array_elements(fields -> 'document_metadata') AS elem),
        '[]'::jsonb
    )
)
WHERE jsonb_typeof(fields) = 'object' AND form_id IN (SELECT id FROM form_models WHERE module = 'splitter');

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
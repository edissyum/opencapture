-- Ajout de la nouvelle table gérant les paramètres favoris
CREATE TABLE settings_favorites
(
    "id"      SERIAL UNIQUE PRIMARY KEY,
    "user_id" INTEGER,
    "route"   VARCHAR(255)
);

-- Ajout de la colonne original_filename dans les batchs du Splitter
ALTER TABLE splitter_batches
    ADD COLUMN original_filename VARCHAR(255);

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
                                             (SELECT jsonb_agg(jsonb_build_array(elem))
                                              FROM jsonb_array_elements(value) AS t(elem)),
                                             '[]'::jsonb
                                     )
                                 ELSE
                                     value
                                 END
                     )
              FROM jsonb_each(fields))
WHERE jsonb_typeof(fields) = 'object';

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
ALTER TABLE outputs ALTER COLUMN compress_type SET DATA TYPE VARCHAR(12);

UPDATE outputs
SET compress_type = 'no_compress'
WHERE compress_type IN ('', NULL)
  AND output_type_id IN ('export_pdf', 'export_cmis', 'export_openads');
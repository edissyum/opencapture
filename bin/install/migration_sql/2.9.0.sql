ALTER TABLE invoices ADD COLUMN facturx BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN facturx_level VARCHAR(20);

ALTER TABLE form_models ADD COLUMN "labels" JSONB DEFAULT '{}';

CREATE TABLE monitoring
(
    "id"                 SERIAL         UNIQUE PRIMARY KEY,
    "input_id"           VARCHAR(255),
    "status"             VARCHAR(10),
    "elapsed_time"       VARCHAR(20),
    "document_ids"       INTEGER[],
    "error"              BOOLEAN        DEFAULT False,
    "module"             VARCHAR(10)    NOT NULL,
    "source"             VARCHAR(10)    NOT NULL,
    "creation_date"      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date"           TIMESTAMP,
    "filename"           VARCHAR(255),
    "steps"              JSONB          DEFAULT '{}'
);

INSERT INTO "privileges" ("label", "parent") VALUES ('update_status', 'splitter');
INSERT INTO "privileges" ("label", "parent") VALUES ('update_status', 'verifier');

INSERT INTO "outputs_types" ("output_type_id", "output_type_label", "module", "data") VALUES ('export_facturx', 'Export PDF avec métadonnée (FacturX)', 'verifier', '{
    "options": {
        "auth": [],
        "parameters": [
            {
                "id": "folder_out",
                "type": "text",
                "label": "Dossier de sortie",
                "required": "true",
                "placeholder": "/var/share/export/verifier/"
            },
            {
                "id": "separator",
                "type": "text",
                "label": "Séparateur",
                "required": "true",
                "placeholder": "_"
            },
            {
                "id": "filename",
                "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "type": "text",
                "label": "Nom du fichier",
                "required": "true",
                "placeholder": "invoice_number#quotation_number#supplier_name"
            }
        ]
    }
}');
INSERT INTO "outputs" ("output_type_id", "output_label", "module", "data") VALUES ('export_facturx', 'Export PDF avec métadonnées (FacturX)', 'verifier', '{"options": {"auth": [], "parameters": [{"id": "folder_out", "type": "text", "value": "/var/share/export/verifier/"}, {"id": "separator", "type": "text", "value": "_"}, {"id": "filename", "type": "text", "value": "invoice_number#F#document_date#vat_number"}]}}');

CREATE TABLE "users_forms"
(
    "id"       SERIAL   UNIQUE PRIMARY KEY,
    "user_id"  INTEGER,
    "forms_id" JSONB    DEFAULT '{}'
);

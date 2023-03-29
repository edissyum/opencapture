ALTER TABLE form_models ADD COLUMN "labels" JSONB DEFAULT '{}';


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

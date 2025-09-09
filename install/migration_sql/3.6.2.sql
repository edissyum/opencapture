INSERT INTO "outputs_types" ("output_type_id", "output_type_label", "data", "module") VALUES ('export_cmis', 'Export CMIS','{
    "options": {
        "auth": [
            {
                "id": "cmis_ws",
                "type": "text",
                "label": "CMIS Web-Service",
                "required": "true",
                "placeholder": "http://localhost//alfresco/api/-default-/public/cmis/versions/1.1/browser"
            },
            {
                "id": "folder",
                "type": "text",
                "label": "Répertoire de dépôt",
                "required": "true",
                "placeholder": "/OpenCapture/PMI/scans/"
            },
            {
                "id": "login",
                "type": "text",
                "label": "Pseudo de l''utilisateur WS",
                "required": "true",
                "placeholder": "ws_opencapture"
            },
            {
                "id": "password",
                "type": "password",
                "label": "Mot de passe de l''utilisateur WS",
                "required": "true",
                "placeholder": "alfresco"
            }
        ],
        "parameters": [
            {
                "id": "pdf_filename",
                "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "type": "text",
                "label": "Nom du fichier PDF",
                "required": "true",
                "placeholder": "doctype#random"
            },
            {
                "id": "xml_filename",
                "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "type": "text",
                "label": "Nom du fichier XML",
                "required": "false",
                "placeholder": "#random"
            },
            {
                "id": "separator",
                "hint": "",
                "type": "text",
                "label": "Séparateur",
                "required": "true",
                "placeholder": "_"
            },
            {
                "id": "xml_template",
                "hint": "Format XML avec les identifiants techniques des champs, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut, pour boucler entre les documents ajoutez la section  <!-- %END-DOCUMENT-LOOP -->...<!-- %END-DOCUMENT-LOOP -->",
                "type": "textarea",
                "label": "Contenu de fichier XML ",
                "required": "true ",
                "placeholder": "<?xml version=\"1.0\" encoding=\"utf-8\" ?>"
            }
        ]
    }
}', 'verifier');

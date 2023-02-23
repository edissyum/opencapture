-- CRÉATION DES STATUS
INSERT INTO "status" ("id","label","label_long", "module") VALUES ('NEW', 'À valider', 'À valider', 'verifier');
INSERT INTO "status" ("id","label","label_long", "module") VALUES ('END', 'Cloturée', 'Facture validée et cloturée', 'verifier');
INSERT INTO "status" ("id","label","label_long", "module") VALUES ('ERR', 'Erreur', 'Erreur lors de la qualification', 'verifier');
INSERT INTO "status" ("id","label","label_long", "module") VALUES ('DEL', 'Supprimée', 'Supprimée', 'verifier');
INSERT INTO "status" ("id","label","label_long", "module") VALUES ('NEW', 'À valider', 'À valider', 'splitter');
INSERT INTO "status" ("id","label","label_long", "module") VALUES ('END', 'Clotûré', 'Lot clôturé', 'splitter');
INSERT INTO "status" ("id","label","label_long", "module") VALUES ('DEL', 'Supprimé', 'Supprimé', 'splitter');
INSERT INTO "status" ("id","label","label_long", "module") VALUES ('MERG', 'Fusionné', 'Fusionné', 'splitter');

-- CRÉATION DES MÉTHODES D'AUTHENTIFICATION PAR DÉFAUT
INSERT INTO "login_methods" ("method_name", "method_label", "enabled", "data") VALUES ('default', 'Authentification par defaut', True, '{}');
INSERT INTO "login_methods" ("method_name", "method_label", "enabled", "data") VALUES ('ldap', 'Authentification par LDAP', False, '{"host": "", "port": "", "baseDN": "", "suffix": "","prefix": "", "typeAD": "", "usersDN": "", "classUser": "", "loginAdmin": "", "classObject": "", "passwordAdmin": "", "attributLastName": "", "attributFirstName": "", "attributSourceUser": "", "attributRoleDefault": ""}');

-- CRÉATION D'UNE CHAINE DE MAILCOLLECT PAR DÉFAUT
INSERT INTO "mailcollect" ("name", "hostname", "port", "login", "password", "secured_connection", "folder_to_crawl", "folder_destination", "folder_trash", "action_after_process") VALUES ('MAIL_1', '', '993', '', '', True, '', '', '', 'move');

-- CRÉATION DES PARAMÈTRES
INSERT INTO "configurations" ("label", "data") VALUES ('jwtExpiration', '{"type": "int", "value": "1440", "description": "Délai avant expiration du token d''authentification (en minutes)"}');
INSERT INTO "configurations" ("label", "data") VALUES ('timeDelta', '{"type": "int", "value": "-1", "description": "Delta maximum pour remonter une date de facture, en jours. -1 pour désactiver"}');
INSERT INTO "configurations" ("label", "data") VALUES ('invoiceSizeMin', '{"type": "int", "value": "6", "description": "Taille minimale pour un numéro de facture"}');
INSERT INTO "configurations" ("label", "data") VALUES ('devisSizeMin', '{"type": "int", "value": "3", "description": "Taille minimale pour un numéro de devis"}');
INSERT INTO "configurations" ("label", "data") VALUES ('loginMessage', '{"type": "string", "value": "Open-Capture - LAD / RAD", "description": "Court message affiché sur l''écran d''accueil"}');
INSERT INTO "configurations" ("label", "data") VALUES ('allowUserMultipleLogin', '{"type": "bool", "value": true, "description": "Autoriser un utilisateur à être connecté sur plusieurs machines simultanément"}');
INSERT INTO "configurations" ("label", "data") VALUES ('restrictInputsPath', '{"type": "bool", "value": false, "description": "Activer la restriction du chemin sur le dossier des chaînes entrantes"}');
INSERT INTO "configurations" ("label", "data") VALUES ('restrictOutputsPath', '{"type": "bool", "value": false, "description": "Activer la restriction du chemin sur le dossier des chaînes sortantes"}');
INSERT INTO "configurations" ("label", "data", "display") VALUES ('locale', '{"type": "string", "value": "fra", "description": "Clé pour la sélection de la langue (fra ou eng par défaut)"}', false);
INSERT INTO "configurations" ("label", "data", "display") VALUES ('mailCollectGeneral', '{
    "type": "json",
    "value": {
        "batchPath": "/var/www/html/opencapture/bin/data/MailCollect/",
        "smtpNotifOnError": false,
        "smtpSSL": true,
        "smtpStartTLS": false,
        "smtpHost": "",
        "smtpPort": "",
        "smtpAuth": "",
        "smtpLogin": "",
        "smtpPwd": "",
        "smtpFromMail": "",
        "smtpDestAdminMail": "",
        "smtpDelay": "30"
    },
    "description": "Paramétrage par défaut du MailCollect"
}', false);
INSERT INTO "configurations" ("label", "data", "display") VALUES ('userQuota', '{
    "type": "json",
    "value": {
        "enabled": false,
        "quota": 20,
        "users_filtered": ["admin", "admin_fct"],
        "email_dest": ""
    },
    "description": ""
}', false);
INSERT INTO "configurations" ("label", "data", "display") VALUES ('passwordRules', '{
    "type": "json",
    "value": {
        "minLength": 8,
        "uppercaseMandatory": false,
        "numberMandatory": true,
        "specialCharMandatory": false
    },
    "description": ""
}', false);

-- CRÉATION DES DOCSERVERS
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('PROJECT_PATH', 'Chemin vers l''instance d''Open-Capture', '/var/www/html/opencapture/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('LOCALE_PATH', 'Chemin vers le dossier contenant les fichiers de traductions', '/var/www/html/opencapture/src/assets/locale/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('ERROR_PATH', 'Chemin vers le dossier des batches en erreur', '/var/www/html/opencapture/bin/data/error/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('TMP_PATH', 'Chemin vers le dossier temporaires utilisé lors du traitement des documents', '/var/www/html/opencapture/bin/data/tmp/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SCRIPTS_PATH', 'Chemin vers le dossier contenant les différents scripts', '/var/www/html/opencapture/bin/scripts/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('CONFIG_PATH', 'Chemin vers le dossier contenant les différents fichiers de configurations', '/var/www/html/opencapture/instance/config/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('DOCSERVERS_PATH', 'Chemin vers la zone de stockage', '/var/docservers/opencapture/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('REFERENTIALS_PATH', 'Chemin vers le dossier contenant les fichiers de référentiel', '/var/www/html/opencapture/instance/referencial/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SEPARATOR_QR_TMP', '[SÉPARATION PAR QR CODE] Chemin vers le dossier temporaire pour la séparation par QR Code', '/tmp/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SEPARATOR_OUTPUT_PDF', '[SÉPARATION PAR QR CODE] Chemin vers le dossier de sortie des PDF', '/var/www/html/opencapture//bin/data/exported_pdf/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SEPARATOR_OUTPUT_PDFA', '[SÉPARATION PAR QR CODE] Chemin vers le dossier de sortie des PDF/A', '/var/www/html/opencapture//bin/data/exported_pdfa/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('VERIFIER_THUMB', '[VERIFIER] Chemin pour le stockage des miniatures', '/var/docservers/opencapture/verifier/thumbs/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('VERIFIER_IMAGE_FULL', '[VERIFIER] Chemin pour le stockage des images', '/var/docservers/opencapture/verifier/full/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('VERIFIER_POSITIONS_MASKS', '[VERIFIER] Chemin pour le stockage des images nécessaire aux masques de positionnement', '/var/docservers/opencapture/verifier/positions_masks/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('VERIFIER_TRAIN_PATH_FILES', '[VERIFIER] Chemin vers le dossier contenant les données d''entraînement', '/var/docservers/opencapture/verifier/ai/train_data');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('VERIFIER_AI_MODEL_PATH', '[VERIFIER] Chemin vers le dossier contenant le modèle de prédiction', '/var/docservers/opencapture/verifier/ai/models/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SPLITTER_BATCHES', '[SPLITTER] Chemin vers le dossier de stockage des dossiers de batch après traitement', '/var/docservers/opencapture/splitter/batches/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SPLITTER_THUMB', '[SPLITTER] Chemin pour le stockage des miniatures', '/var/docservers/opencapture/splitter/thumbs/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SPLITTER_ORIGINAL_PDF', '[SPLITTER] Chemin vers le dossier contenant les PDF originaux', '/var/docservers/opencapture/splitter/original_pdf/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SPLITTER_METHODS_PATH', '[SPLITTER] Chemin vers le dossier contenant les différents scripts de séparation', '/var/www/html/opencapture/bin/scripts/splitter_methods/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SPLITTER_METADATA_PATH', '[SPLITTER] Chemin vers le dossier contenant les différents scripts de récupération de métadonnées', '/var/www/html/opencapture/bin/scripts/splitter_metadata/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SPLITTER_TRAIN_PATH_FILES', '[SPLITTER] Chemin vers le dossier contenant les données d''entraînement', '/var/docservers/opencapture/splitter/ai/train_data');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('SPLITTER_AI_MODEL_PATH', '[SPLITTER] Chemin vers le dossier contenant le modèle de prédiction', '/var/docservers/opencapture/splitter/ai/models/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('INPUTS_ALLOWED_PATH', 'Chemin autorisé du dossier d''entrée des fichiers importés', '/var/share/');
INSERT INTO "docservers" ("docserver_id", "description", "path") VALUES ('OUTPUTS_ALLOWED_PATH', 'Chemin autorisé du dossier de sortie des fichiers exportés', '/var/share/');

-- CRÉATION DES CHAINES SORTANTES DU MODULE VERIFIER
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "module", "data") VALUES (1, 'export_xml', 'Export XML', 'verifier', '{
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
            },
            {
                "id": "extension",
                "type": "text",
                "hint": "Ne pas mettre de point dans l''extension",
                "label": "Extension du fichier",
                "required": "true",
                "placeholder": "xml"
            }
        ]
    }
}');
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "module", "data") VALUES (2, 'export_mem', 'Export vers MEM Courrier', 'verifier', '{
	"options": {
        "auth": [
            {
                "id": "host",
                "type": "text",
                "label": "URL de l''''hôte",
                "required": "true",
                "placeholder": "http://localhost/mem_courrier/rest/"
            },
            {
                "id": "login",
                "type": "text",
                "label": "Pseudo de l''''utilisateur WS",
                "required": "true",
                "placeholder": "edissyumws"
            },
            {
                "id": "password",
                "type": "password",
                "label": "Mot de passe de l''''utilisateur WS",
                "required": "true",
                "placeholder": "maarch"
            }
        ],
        "links": [
            {
                "id": "enabled",
                "type": "boolean",
                "label": "Activer la liaison avec un document dans MEM Courrier",
                "required": "true",
                "webservice": "",
                "placeholder": ""
            },
            {
                "id": "memCustomField",
                "type": "text",
                "label": "Champ personnalisé à récupérer",
                "required": "false",
                "webservice": "getCustomFieldsFromMem",
                "placeholder": "Numéro de devis",
                "hint": "Champ personnalisé MEM Courrier dans lequel est stocké la donnée nécessaire à la liaison avec un document"
            },
            {
                "id": "openCaptureField",
                "type": "text",
                "label": "Champ à comparer dans Open-Capture",
                "required": "false",
                "webservice": "",
                "placeholder": "quotation_number",
                "hint": "Identifiant du champ dans Open-Capture"
            },
            {
                "id": "memClause",
                "type": "text",
                "label": "Clause de selection des documents dans MEM Courrier",
                "required": "false",
                "webservice": "",
                "placeholder": "status <> ''END''",
                "hint": ""
            },
            {
                "id": "vatNumberContactCustom",
                "type": "text",
                "label": "Identifiant du champ personnalisé de contact où stocker le numéro de TVA + SIRET",
                "required": "true",
                "webservice": "getContactsCustomFieldsFromMem",
                "placeholder": "Identifiant Open-Capture",
                "hint": "Identifiant du champ personnalisé de contact où stocker le numéro de TVA + SIRET"
            }
        ],
        "parameters": [
            {
                "id": "destUser",
                "type": "text",
                "label": "Utilisateur destinataire",
                "required": "true",
                "webservice": "getUsersFromMem",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "status",
                "type": "text",
                "label": "Status",
                "required": "true",
                "webservice": "getStatusesFromMem",
                "placeholder": "Courrier à qualifier"
            },
            {
                "id": "subject",
                "type": "textarea",
                "label": "Sujet",
                "hint": "Liste des identifiants techniques des champs, séparés par #. Si l''''identifiant technique n''''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "required": "true",
                "placeholder": "Facture n°#invoice_number"
            },
            {
                "id": "typeId",
                "type": "text",
                "label": "Type de document",
                "required": "true",
                "webservice": "getDoctypesFromMem",
                "placeholder": "Facture à qualifier"
            },
            {
                "id": "typist",
                "type": "text",
                "label": "Utilisateur Rédacteur",
                "required": "true",
                "webservice": "getUsersFromMem",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "priority",
                "type": "text",
                "label": "Priorité",
                "required": "true",
                "webservice": "getPrioritiesFromMem",
                "placeholder": "Normal"
            },
            {
                "id": "format",
                "type": "text",
                "label": "Format",
                "required": "true",
                "placeholder": "pdf"
            },
            {
                "id": "modelId",
                "type": "text",
                "label": "Modèle d''''enregistrement",
                "required": "true",
                "webservice": "getIndexingModelsFromMem",
                "placeholder": "Facture"
            },
            {
                "id": "destination",
                "type": "text",
                "label": "Entité destinatrice",
                "required": "true",
                "webservice": "getEntitiesFromMem",
                "placeholder": "Service Courrier"
            },
            {
                "id": "customFields",
                "hint": "La valeur doit être de type JSON avec des doubles quotes \". La clé est l''''identifiant du custom MEM Courrier, la valeur est l''''identifiant du champ Open-Capture",
                "type": "textarea",
                "label": "Champs personnalisés",
                "isJson": "true",
                "required": "false",
                "placeholder": "{\"1\": \"invoice_number\", \"2\": \"quotation_number\"}"
            }
        ]
    }
}');
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "module", "data") VALUES (3, 'export_pdf', 'Export PDF', 'verifier', '{
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

INSERT INTO "outputs" ("id", "output_type_id", "output_label", "module", "data") VALUES (1, 'export_xml', 'Export XML par défaut', 'verifier', '{"options": {"auth": [], "parameters": [{"id": "folder_out", "type": "text", "value": "/var/share/export/verifier/"}, {"id": "separator", "type": "text", "value": "_"}, {"id": "filename", "type": "text", "value": "invoice_number#F#document_date#vat_number"}, {"id": "extension", "type": "text", "value": "xml"}]}}');
INSERT INTO "outputs" ("id", "output_type_id", "output_label", "module") VALUES (2, 'export_mem', 'Export MEM Courrier par défaut', 'verifier');
INSERT INTO "outputs" ("id", "output_type_id", "output_label", "module", "data") VALUES (3, 'export_pdf', 'Export PDF par défaut', 'verifier', '{"options": {"auth": [], "parameters": [{"id": "folder_out", "type": "text", "value": "/var/share/export/verifier/"}, {"id": "separator", "type": "text", "value": "_"}, {"id": "filename", "type": "text", "value": "invoice_number#F#document_date#vat_number"}]}}');

-- CRÉATION DES CHAINES SORTANTES DU MODULE SPLITTER
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "data", "module") VALUES (4, 'export_pdf', 'Export PDF', '{
  "options": {
    "auth": [],
    "parameters": [
      {
        "id": "folder_out",
        "type": "text",
        "label": "Dossier de sortie",
        "required": "true",
        "placeholder": "/var/share/sortant"
      },
      {
        "id": "filename",
        "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
        "type": "text",
        "label": "Nom du fichier",
        "required": "true",
        "placeholder": "doctype#nom#prenom#date"
      },
      {
        "id": "separator",
        "type": "text",
        "label": "Séparateur",
        "required": "true",
        "placeholder": "_"
      },
      {
        "id": "extension",
        "hint": "Ne pas mettre de point dans l''''extension",
        "type": "text",
        "label": "Extension du fichier",
        "required": "true",
        "placeholder": "pdf"
      },
      {
        "id": "add_to_zip",
        "hint": "Ajouter le fichier au ZIP, [Except=doctype1] mentionne les type de document à ne pas ajouter dans le ZIP",
        "type": "text",
        "label": "Nom du fichier ZIP à exporter",
        "required": "false",
        "placeholder": "splitter-files.zip[Except=doctype1,doctype2]"
      }
    ]
  }
}', 'splitter');
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "data", "module") VALUES (5, 'export_xml', 'Export XML', '{
  "options": {
    "auth": [],
    "parameters": [
      {
        "id": "folder_out",
        "type": "text",
        "label": "Dossier de sortie",
        "required": "true",
        "placeholder": "/var/share/sortant"
      },
      {
        "id": "filename",
        "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
        "type": "text",
        "label": "Nom du fichier",
        "required": "true",
        "placeholder": "doctype#nom#prenom#date"
      },
      {
        "id": "separator",
        "type": "text",
        "label": "Séparateur",
        "required": "true",
        "placeholder": "_"
      },
      {
        "id": "extension",
        "hint": "Ne pas mettre de point dans l''''extension",
        "type": "text",
        "label": "Extension du fichier",
        "required": "true",
        "placeholder": "xml"
      },
      {
        "id": "xml_template",
        "hint": "Format XML avec les identifiants techniques des champs, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut, pour boucler entre les documents ajoutez la section  <!-- %END-DOCUMENT-LOOP -->...<!-- %END-DOCUMENT-LOOP -->",
        "type": "textarea",
        "label": "Contenu de fichier XML ",
        "required": "true ",
        "placeholder": "<?xml version=\"1.0\" encoding=\"UTF-8\" ?> ..."
      }
    ]
  }
}', 'splitter');
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "data", "module") VALUES (6, 'export_cmis', 'Export CMIS','{
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
        "label": "Pseudo de l''''utilisateur WS",
        "required": "true",
        "placeholder": "edissyumws"
      },
      {
        "id": "password",
        "type": "password",
        "label": "Mot de passe de l''''utilisateur WS",
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
      }
    ]
  }
}', 'splitter');
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "data", "module") VALUES (7, 'export_openads', 'Export OpenADS','{
  "options": {
    "auth": [
      {
        "id": "openads_api",
        "type": "text",
        "label": "OpenAds api",
        "required": "true",
        "placeholder": "https://example.com/demo/openads"
      },
      {
        "id": "login",
        "type": "text",
        "label": "Pseudo de l''''utilisateur WS",
        "required": "true",
        "placeholder": "opencapture"
      },
      {
        "id": "password",
        "type": "password",
        "label": "Mot de passe de l''''utilisateur WS",
        "required": "true",
        "placeholder": "opencapture"
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
        "id": "separator",
        "hint": "",
        "type": "text",
        "label": "Séparateur",
        "required": "true",
        "placeholder": "_"
      },
      {
        "id": "folder_id",
        "hint": "Liste des identifiants techniques, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
        "type": "text",
        "label": "Identifiant du dossier",
        "required": "true",
        "placeholder": "_"
      }
    ]
  }
}', 'splitter');
ALTER SEQUENCE "outputs_types_id_seq" RESTART WITH 8;

INSERT INTO "outputs" ("id", "output_type_id", "output_label", "data", "module") VALUES (4, 'export_pdf', 'Export vers Vérificateur', '{"options": {"auth": [], "parameters": [{"id": "folder_out", "type": "text", "value": "/var/share/entrant/verifier/"}, {"id": "filename", "type": "textarea", "value": "PDF#doctype#date#random"}, {"id": "separator", "type": "text", "value": "_"}, {"id": "extension", "type": "text", "value": "pdf"}]}}', 'splitter');
INSERT INTO "outputs" ("id", "output_type_id", "output_label", "data", "module") VALUES (5, 'export_xml', 'Export XML par défaut', '{"options": {"auth": [], "parameters": [{"id": "folder_out", "type": "text", "value": "/var/share/export/splitter/"}, {"id": "filename", "type": "textarea", "value": "XML#date"}, {"id": "separator", "type": "text", "value": "_"}, {"id": "extension", "type": "text", "value": "xml"}]}}', 'splitter');
INSERT INTO "outputs" ("id", "output_type_id", "output_label", "data", "module") VALUES (6, 'export_cmis', 'Export Alfresco par défaut', '{"options": {"auth": [{"id": "cmis_ws", "type": "text", "value": ""}, {"id": "folder", "type": "text", "value": ""}, {"id": "login", "type": "text", "value": ""}, {"id": "password", "type": "password", "value": ""}], "parameters": [{"id": "pdf_filename", "type": "textarea", "value": "#doctype#date"}, {"id": "xml_filename", "type": "textarea", "value": "#random#date"}, {"id": "separator", "type": "textarea", "value": "_"}]}}', 'splitter');
INSERT INTO "outputs" ("id", "output_type_id", "output_label", "data", "module") VALUES (7, 'export_openads', 'Export OpenADS', '{"options": {"auth": [{"id": "openads_api", "type": "text", "value": " https://example.fr/openads"}, {"id": "login", "type": "text", "value": "opencapture"}, {"id": "password", "type": "password", "value": "opencapture"}], "parameters": [{"id": "pdf_filename", "type": "text", "value": "#dotype#id"}, {"id": "separator", "type": "text", "value": "_"}, {"id": "folder_id", "type": "text", "value": ""}]}}', 'splitter');
ALTER SEQUENCE "outputs_id_seq" RESTART WITH 8;

-- CRÉATION DES TEMPLATES DES PARAMETRES DES FORMULAIRE
INSERT INTO "form_model_settings" ("id", "module", "settings") VALUES (1, 'verifier', '{
    "display": {
        "subtitles": [
            {"id": "invoice_number", "label": "FACTURATION.invoice_number"},
            {"id": "document_date", "label": "FACTURATION.document_date"},
            {"id": "date", "label": "VERIFIER.register_date"},
            {"id": "original_filename", "label": "VERIFIER.original_file"},
            {"id": "form_label", "label": "ACCOUNTS.form"}
        ]
    },
    "supplier_verif": false,
    "automatic_validation_data": "",
    "allow_automatic_validation": false,
    "delete_documents_after_outputs": false
}');
INSERT INTO "form_model_settings" ("id", "module", "settings") VALUES (2, 'splitter', '{
    "metadata_method": "",
    "export_zip_file": ""
}');

-- CRÉATION DES FORMULAIRES VERIFIER PAR DÉFAUT
INSERT INTO "form_models" ("id", "label", "default_form", "outputs", "module", "settings") VALUES (1, 'Formulaire par défaut', true, '{1,3}', 'verifier',  '{
    "display": {
        "subtitles": [
            {"id": "invoice_number", "label": "FACTURATION.invoice_number"},
            {"id": "document_date", "label": "FACTURATION.document_date"},
            {"id": "date", "label": "VERIFIER.register_date"},
            {"id": "original_filename", "label": "VERIFIER.original_file"},
            {"id": "form_label", "label": "ACCOUNTS.form"}
        ]
    },
    "supplier_verif": false,
    "automatic_validation_data": "",
    "allow_automatic_validation": false,
    "delete_documents_after_outputs": false
}');
INSERT INTO "form_models_field" ("id", "form_id", "fields") VALUES (1, 1, '{"other": [], "supplier": [{"id": "name", "type": "text", "unit": "supplier", "class": "w-full", "color": "white", "label": "ACCOUNTS.supplier_name", "format": "alphanum", "display": "simple", "required": true, "class_label": "1", "format_icon": "fas fa-hashtag", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "address1", "type": "text", "unit": "addresses", "class": "w-1/2", "label": "ADDRESSES.address_1", "format": "alphanum_extended_with_accent", "display": "simple", "required": true, "class_label": "1/2", "format_icon": "fas fas fa-hashtag", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "address2", "type": "text", "unit": "addresses", "class": "w-1/2", "label": "ADDRESSES.address_2", "format": "alphanum_extended_with_accent", "display": "simple", "required": false, "class_label": "1/2", "format_icon": "fas fas fa-hashtag", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "far fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "postal_code", "type": "text", "unit": "addresses", "class": "w-1/3", "label": "ADDRESSES.postal_code", "format": "number_int", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-calculator", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "city", "type": "text", "unit": "addresses", "class": "w-1/3", "label": "ADDRESSES.city", "format": "alphanum_extended_with_accent", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-font", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "country", "type": "text", "unit": "addresses", "class": "w-1/3", "label": "ADDRESSES.country", "format": "alphanum_extended_with_accent", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-font", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "vat_number", "type": "text", "unit": "supplier", "class": "w-1/3", "color": "olive", "label": "ACCOUNTS.vat_number", "format": "alphanum", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fas fa-hashtag", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "siren", "type": "text", "unit": "supplier", "class": "w-1/6", "color": "lime", "label": "ACCOUNTS.siren", "format": "number_int", "display": "simple", "required": false, "class_label": "1/6", "format_icon": "fas fa-calculator", "display_icon": "fas fa-file-alt", "required_icon": "far fa-star"}, {"id": "siret", "type": "text", "unit": "supplier", "class": "w-1/6", "color": "green", "label": "ACCOUNTS.siret", "format": "number_int", "display": "simple", "required": false, "class_label": "1/6", "format_icon": "fas fa-calculator", "display_icon": "fas fa-file-alt", "required_icon": "far fa-star"}, {"id": "email", "type": "text", "unit": "supplier", "class": "w-1/3", "color": "green", "label": "FORMATS.email", "format": "email", "display": "simple", "required": false, "class_label": "1/33", "format_icon": "fa-solid fa-at", "autocomplete": "none", "display_icon": "fa-solid fa-file-alt", "required_icon": "far fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}], "facturation": [{"id": "invoice_number", "type": "text", "unit": "facturation", "class": "w-1/2", "color": "red", "label": "FACTURATION.invoice_number", "format": "alphanum_extended", "display": "simple", "required": true, "class_label": "1/2", "format_icon": "fas fa-level-up-alt", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "quotation_number", "type": "text", "unit": "facturation", "class": "w-1/2", "color": "orange", "label": "FACTURATION.quotation_number", "format": "alphanum_extended", "display": "simple", "required": false, "class_label": "1/2", "format_icon": "fa-solid fa-hashtag", "display_icon": "fa-solid fa-file-alt", "required_icon": "fa-solid fa-star"}, {"id": "delivery_number", "type": "text", "unit": "facturation", "class": "w-1/3", "color": "orange", "label": "FACTURATION.delivery_number", "format": "alphanum_extended", "display": "multi", "required": false, "class_label": "1/33", "format_icon": "fas fa-hashtag fa-level-up-alt", "autocomplete": "none", "display_icon": "fas fa-layer-group", "required_icon": "far fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "document_date", "type": "date", "unit": "facturation", "class": "w-1/3", "color": "aqua", "label": "FACTURATION.document_date", "format": "date", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-calendar-day", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "document_due_date", "type": "date", "unit": "facturation", "class": "w-1/3", "color": "blue", "label": "FACTURATION.document_due_date", "format": "date", "display": "simple", "required": false, "class_label": "1/33", "format_icon": "fas fa-calendar-day", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "far fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "vat_rate", "type": "text", "unit": "facturation", "class": "w-1/4", "color": "pink", "label": "FACTURATION.vat_rate", "format": "number_float", "display": "multi", "required": true, "class_label": "1/4", "format_icon": "fas fa-calculator", "autocomplete": "none", "display_icon": "fas fa-layer-group", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "no_rate_amount", "type": "text", "unit": "facturation", "class": "w-1/4", "color": "fuchsia", "label": "FACTURATION.no_rate_amount", "format": "number_float", "display": "multi", "required": true, "class_label": "1/4", "format_icon": "fas fa-calculator", "autocomplete": "none", "display_icon": "fas fa-layer-group", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "vat_amount", "type": "text", "unit": "facturation", "class": "w-1/4", "color": "purple", "label": "FACTURATION.vat_amount", "format": "number_float", "display": "multi", "required": true, "class_label": "1/4", "format_icon": "fas fa-calculator", "autocomplete": "none", "display_icon": "fas fa-layer-group", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "accounting_plan", "type": "select", "unit": "facturation", "class": "w-1/4", "label": "FACTURATION.accounting_plan", "required": false, "class_label": "1/4", "autocomplete": "none", "required_icon": "far fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "total_vat", "type": "text", "unit": "facturation", "class": "w-1/3", "color": "", "label": "FACTURATION.total_vat", "format": "number_float", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-calculator", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "total_ttc", "type": "text", "unit": "facturation", "class": "w-1/3", "label": "FACTURATION.total_ttc", "format": "number_float", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-calculator", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}, {"id": "total_ht", "type": "text", "unit": "facturation", "class": "w-1/3", "label": "FACTURATION.total_ht", "format": "number_float", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-calculator", "autocomplete": "none", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star", "autocomplete_data": [], "autocomplete_icon": "fa-solid fa-ban"}]}');

INSERT INTO "form_models" ("id", "label", "default_form", "outputs", "module", "settings") VALUES (2, 'OCRisation simple', false, '{1,3}', 'verifier',  '{
    "supplier_verif": false,
    "automatic_validation_data": "only_ocr",
    "allow_automatic_validation": true,
    "delete_documents_after_outputs": true
}');
INSERT INTO "form_models_field" ("id", "form_id", "fields") VALUES (2, 2, '{"other": [], "supplier": []}');

-- CRÉATION DU FORMULAIRE SPLITTER PAR DÉFAUT
INSERT INTO "form_models" ("id", "label", "default_form", "outputs", "module", "settings") VALUES (3, 'Formulaire par défaut', true, '{4}', 'splitter', '{
    "metadata_method": "",
    "export_zip_file": ""
}');
INSERT INTO "form_models_field" ("id", "form_id", "fields") VALUES (3, 3, '{"batch_metadata": [], "document_metadata": []}');
ALTER SEQUENCE "form_models_id_seq" RESTART WITH 4;
ALTER SEQUENCE "form_models_field_id_seq" RESTART WITH 4;

-- CRÉATION DES TYPES DE DOCUMENTS SPLITTER PAR DÉFAUT
INSERT INTO "doctypes" ("key", "label", "code", "is_default", "type", "form_id") VALUES ('identification_docs', 'Documents d''identité', '0.1', 'f', 'folder', 3);
INSERT INTO "doctypes" ("key", "label", "code", "is_default", "type", "form_id") VALUES ('national_card', 'Carte Nationale d''Identité', '0.1.1', 't', 'document', 3);
INSERT INTO "doctypes" ("key", "label", "code", "is_default", "type", "form_id") VALUES ('passport', 'Passeport', '0.1.2', 'f', 'document', 3);
INSERT INTO "doctypes" ("key", "label", "code", "is_default", "type", "form_id") VALUES ('driving_license', 'Permis de conduire', '0.1.3', 'f', 'document', 3);

-- CRÉATION DES CHAINES ENTRANTES
INSERT INTO "inputs" ("id", "input_id", "input_label", "default_form_id", "input_folder", "module", "splitter_method_id") VALUES (1, 'default_input', 'Chaîne entrante par défaut', 1, '/var/share/entrant/verifier/', 'verifier', 'no_sep');
INSERT INTO "inputs" ("id", "input_id", "input_label", "default_form_id", "input_folder", "module", "splitter_method_id") VALUES (2, 'default_input', 'Chaîne entrante par défaut', 3, '/var/share/entrant/splitter/', 'splitter', 'qr_code_OC');
ALTER SEQUENCE "inputs_id_seq" RESTART WITH 3;

-- CRÉATION DES CHAMPS CUSTOMS POUR LE SPLITTER
INSERT INTO custom_fields ("id", "label_short", "metadata_key", "label", "type", "module") VALUES (1, 'nom_usage', 'nom_usage', 'Nom d''usage', 'text', 'splitter');
INSERT INTO custom_fields ("id", "label_short", "metadata_key", "label", "type", "module") VALUES (2, 'prenom', 'prenom', 'Prénom', 'text', 'splitter');
INSERT INTO custom_fields ("id", "label_short", "metadata_key", "label", "type", "module") VALUES (3, 'contrat', 'contrat', 'Contrat', 'text', 'splitter');
INSERT INTO custom_fields ("id", "label_short", "metadata_key", "label", "type", "module") VALUES (4, 'date_naissance', 'date_naissance', 'Date de naissance', 'text', 'splitter');
INSERT INTO custom_fields ("id", "label_short", "metadata_key", "label", "type", "module") VALUES (5, 'matricule', 'matricule', 'Matricule', 'text', 'splitter');
ALTER SEQUENCE "custom_fields_id_seq" RESTART WITH 6;

-- CRÉATION DES PRIVILEGES
INSERT INTO "privileges" ("id", "label", "parent") VALUES (1, 'access_verifier', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (2, 'access_splitter', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (3, 'settings', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (4, 'upload', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (6, 'users_list', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (7, 'add_user', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (8, 'update_user', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (9, 'roles_list', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (10, 'add_role', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (11, 'update_role', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (12, 'custom_fields', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (13, 'forms_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (14, 'add_form', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (15, 'update_form', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (16, 'suppliers_list', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (17, 'create_supplier', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (18, 'update_supplier', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (19, 'customers_list', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (20, 'create_customer', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (21, 'update_customer', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (22, 'change_language', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (23, 'outputs_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (24, 'add_output', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (25, 'update_output', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (26, 'inputs_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (27, 'update_input', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (28, 'add_input', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (29, 'export_suppliers', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (30, 'position_mask_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (31, 'add_position_mask', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (32, 'update_position_mask', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (33, 'history', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (34, 'separator_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (35, 'add_input_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (36, 'update_input_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (37, 'inputs_list_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (38, 'update_output_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (39, 'add_output_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (40, 'outputs_list_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (41, 'update_form_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (42, 'add_form_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (43, 'forms_list_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (44, 'add_document_type', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (45, 'update_document_type', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (46, 'import_suppliers', 'accounts');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (47, 'statistics', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (48, 'configurations', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (49, 'docservers', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (50, 'regex', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (51, 'document_type_splitter', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (52, 'login_methods', 'administration');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (53, 'verifier_display', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (54, 'mailcollect', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (55, 'user_quota', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (56, 'list_ai_model', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (57, 'create_ai_model', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (58, 'update_ai_model', 'splitter');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (59, 'monitoring', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (60, 'list_ai_model', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (61, 'create_ai_model', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (62, 'update_ai_model', 'verifier');
ALTER SEQUENCE "privileges_id_seq" RESTART WITH 63;

-- CRÉATION DES ROLES
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (1, 'superadmin', 'SuperUtilisateur', 'false');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (2, 'admin', 'Administrateur', 'true');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (3, 'user', 'Utilisateur', 'true');
ALTER SEQUENCE "roles_id_seq" RESTART WITH 4;

-- AJOUT DES PRIVILEGES LIÉS AUX ROLES
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (1, '{"data" : "[''*'']"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (2, '{"data" : "[1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 51]"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (3, '{"data" : "[1, 2, 4, 16, 17, 18, 29, 33, 47]"}');

-- CRÉATION DE L'UTILISATEUR superadmin
INSERT INTO "users" ("username","firstname", "lastname","password", "role") VALUES ('admin', 'Super', 'ADMIN', 'pbkdf2:sha256:150000$7c8waI7f$c0891ac8e18990db0786d4a49aea8bf7c1ad82796dccd8ae35c12ace7d8ee403', 1);

-- CRÉATION D'UN MASQUE DE POSITIONNEMENT D'EXEMPLE
INSERT INTO "positions_masks" ("id", "label", "form_id", "regex") VALUES (1, 'Masque par défaut', 1, '{"document_date": "date", "document_due_date": "date"}');
ALTER SEQUENCE "positions_masks_id_seq" RESTART WITH 2;

-- CRÉATION DES COMPTES DE CHARGE PAR DÉFAUT
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('1020 0000', 'Provisions pour travaux décidés');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('1031 0001', 'Avances de trésorerie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('1032 0000', 'Avances travaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('1033 0000', 'Autres avances');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('1050 0000', 'Fonds de travaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('1200 0000', 'Solde en attente sur travaux et opérations exceptionnelles');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('1300 0000', 'Subventions');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('1310 0000', 'Subventions accordées en instance de versement');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4000 0000', 'Fournisseurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4010 0000', 'Factures parvenues');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4080 0001', 'Factures non parvenues');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4090 0000', 'Fournisseurs débiteurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4200 0000', 'Personnel');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4210 0000', 'Rémunérations dues');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4210 0001', 'Employé d’immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4210 0002', 'Gardien');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4211 0000', 'Personnel - Autres opérations');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4310 0000', 'Sécurité sociale');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4320 0000', 'Organismes sociaux - parts dues');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4320 0001', 'Organisme complémentaire santé');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4320 0002', 'Organisme retraite');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4320 0003', 'Organisme formation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4320 0004', 'Organisme prélèvement à la source');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4320 0005', 'Organisme collecteur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4400 0000', 'État et collectivités territoriales');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4410 0000', 'État et autres organismes - subventions à recevoir');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4420 0000', 'État - impôts et versements assimilés');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4430 0000', 'Collectivités territoriales - aides');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4500 0000', 'Collectivité des copropriétaires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4500 0000', 'Copropriétaire individualisé');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4501 0000', 'Copropriétaire - budget prévisionnel');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4502 0000', 'Copropriétaire - travaux de l''article 14-2 de la loi susvisée et opérations exceptionnelles');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4503 0000', 'Copropriétaire - avances');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4504 0000', 'Copropriétaire - emprunts');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4505 0000', 'Copropriétaire - fonds de travaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4590 0000', 'Copropriétaire - créances douteuses');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4600 0000', 'Débiteurs et créditeurs divers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4610 0000', 'Débiteurs divers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4610 0001', 'Anciens copropriétaires débiteurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4620 0000', 'Créditeurs divers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4620 0001', 'Anciens copropriétaires créditeurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4650 0000', 'Servitudes - Bénéficiaires individualisés');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4660 0000', 'Locataire syndicat');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4700 0000', 'Compte d''attente');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4710 0000', 'Compte en attente d''imputation débiteur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4711 0000', 'Régularisation des charges - Débiteur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4712 0000', 'Régularisation des travaux - Débiteur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4718 0000', 'Compte en attente d''imputation débiteur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4719 0000', 'Erreur de paiement débiteur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4720 0000', 'Compte en attente d''imputation créditeur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4721 0000', 'Régularisation des charges - Créditeur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4722 0000', 'Régularisation des travaux - Créditeur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4728 0000', 'Compte en attente d''imputation créditeur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4729 0000', 'Erreur de paiement créditeur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4730 0000', 'Rompus');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4730 0001', 'Compte en attente d''imputation - Tiers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4731 0001', 'Compte en attente d''imputation - Rémunération et cotisations');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4732 0001', 'Compte en attente d''imputation - Organismes sociaux collecteurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4733 0001', 'Compte en attente d''imputation – État et collectivités territoriales');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4734 0001', 'Compte en attente d''imputation - Servitudes');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4735 0001', 'Compte en attente d''imputation - Locataires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4736 0001', 'Compte en attente d''imputation - Ensemble immobilier');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4740 0000', 'Stocks');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4750 0000', 'Sinistres');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4761 0000', 'Banque ancien syndic');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4762 0000', 'Banque nouveau syndic');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4763 0000', 'Banque écart rapprochement bancaire');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4800 0000', 'Compte de régularisation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4860 0000', 'Charges constatées d''avance');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4870 0000', 'Produits encaissés d''avance');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4900 0000', 'Dépréciation des comptes de tiers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4910 0000', 'Dépréciation des copropriétaires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('4920 0000', 'Dépréciation personnes autres que les copropriétaires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5000 0000', 'Comptes financiers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5000 0000', 'Fonds placés');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5010 0000', 'Compte à terme');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5020 0000', 'Autre compte');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5100 0000', 'Banques');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5111 0000', 'Chèques en attente de décaissement');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5112 0000', 'Chèques à encaisser');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5113 0000', 'Prélèvements en attente');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5120 0000', 'Banques');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5140 0000', 'Chèques postaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('5300 0000', 'Caisse');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6000 0000', 'Comptes de charges');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6000 0000', 'Achats de matières et fournitures');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6010 0000', 'Eau');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6010 0001', 'Facture d''eau');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6010 0002', 'Eau froide - Loge');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6010 0003', 'Eau chaude - Loge');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6010 0004', 'Eau des parties communes');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6010 0005', 'Eau des espaces verts');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6010 0006', 'Eau froide pour eau chaude');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6010 0007', 'Eau piscine');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6020 0000', 'Électricité');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6020 0001', 'Consommation Électricité');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6030 0000', 'Chauffage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6030 0001', 'Consommation fioul');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6030 0002', 'Consommation gaz');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6030 0003', 'Réchauffement eau');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6030 0004', 'Consommation Électricité - Chauffage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6030 0005', 'Consommation Chaleur - Chauffage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6030 0006', 'Chauffage parties communes');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6040 0000', 'Achats produits d''entretien et petits équipements');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6040 0001', 'Achats produits d''entretien et petits équipements');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6040 0002', 'Équipement et frais d''agencement');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6050 0000', 'Matériel');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6050 0001', 'Fournitures matériel électrique');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6050 0002', 'Achat tapis brosse');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6050 0003', 'Achat badges / bips / Émetteurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6050 0004', 'Achat matériel hygiène');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0000', 'Fournitures');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0001', 'Fournitures plomberie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0002', 'Remplacement petites fournitures');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0003', 'Fournitures hygiène');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0004', 'Fournitures produits d''entretien');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0005', 'Produits d''entretien piscine');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0007', 'Fournitures de bureau');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0008', 'Fournitures diverses récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6060 0009', 'Fournitures diverses non-récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6000 0999', 'En attente d''imputation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6100 0000', 'Services extérieurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6110 0000', 'Nettoyage des locaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6110 0001', 'Entretien nettoyage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6110 0002', 'Nettoyage vitrerie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6120 0000', 'Locations immobilières');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6120 0001', 'Loyer loge');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6120 0002', 'Loyer foncier');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6120 0003', 'Charges loge - déductible');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6120 0004', 'Charges loge - récupérable');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6130 0000', 'Locations mobilières');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6130 0001', 'Location tapis brosses');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6130 0002', 'Contrat location & entretien compteurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6130 0003', 'Location salle de réunion');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6130 0004', 'Locations mobilières');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0000', 'Contrats de maintenance');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0001', 'Entretien Électricité');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0002', 'Contrat ramonage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0003', 'Entretien ventilations');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0004', 'Entretien extracteur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0005', 'Entretien interphones');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0006', 'Entretien climatisation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0007', 'Factures téléphone');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0008', 'Entretien contrôle d''accès');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0009', 'Entretien portes automatiques');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0010', 'Contrat entretien ascenseur - simple');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0011', 'Contrat entretien ascenseur - étendu');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0012', 'Contrat entretien chauffage - simple');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0013', 'Entretien piscine');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0014', 'Entretien vide-ordures');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0015', 'Entretien divers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0016', 'Contrat location bacs roulants');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0017', 'Contrat entretien Chauffage étendu');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0018', 'Contrat entretien - Jardins & espaces verts');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0019', 'Contrat service informatique');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0020', 'Contrat antenne TV');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0021', 'Déneigement');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0022', 'Contrat sécurité & gardiennage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0023', 'Contrat de sécurité incendie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0024', 'Contrat de maintenance de la pompe de relevage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0025', 'Frais d''abonnement');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0026', 'Entretien toiture');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0027', 'Entretien dératisation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0028', 'Entretien désinsectisation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0029', 'Entretien serrurerie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0030', 'Chaufferie - chauffage de l''eau');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6140 0031', 'Assainissement de l''eau');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0000', 'Entretien et petites réparations');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0001', 'Travaux plomberies');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0002', 'Travaux zinguerie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0003', 'Travaux électricité');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0004', 'Travaux maçonnerie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0005', 'Travaux menuiserie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0006', 'Travaux peinture & revêtement');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0007', 'Travaux ravalement');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0008', 'Travaux hygiène');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0009', 'Dératisation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0010', 'Désinsectisation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0011', 'Travaux de nettoyage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0012', 'Remplacements vitres');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0014', 'Travaux serrurerie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0015', 'Entretien curage des canalisations');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0016', 'Travaux curage canalisations');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0017', 'Travaux pose signalétique');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0018', 'Travaux ventilation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0019', 'Pompe de relevage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0020', 'Travaux extracteur');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0021', 'Entretien matériel sécurité incendie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0022', 'Travaux climatisation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0023', 'Travaux contrôle d''accès');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0024', 'Travaux portes automatiques');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0025', 'Travaux ascenseurs');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0026', 'Travaux chauffage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0027', 'Travaux jardins & espaces verts');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0028', 'Travaux piscine');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0029', 'Travaux vide-ordures');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0030', 'Travaux divers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0031', 'Travaux étanchéité');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0032', 'Travaux antenne TV');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0033', 'Travaux interphone');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0034', 'Travaux chaufferie - chauffage de l''eau');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6150 0035', 'Travaux d''assainissement de l''eau');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6160 0000', 'Primes d''assurances');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6160 0001', 'Assurance multi-risques');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6160 0002', 'Assurance responsabilité civile');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6160 0003', 'Protection juridique');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6160 0004', 'Assurance impayé');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6170 0000', 'ASL & Copropriété');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6170 0001', 'Appels de fonds');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6170 0002', 'Régularisation Appels de fonds - Récupérable & Déductible');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6170 0003', 'Régularisation Appels de fonds - Récupérable & Non-déductible');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6170 0004', 'Régularisation Appels de fonds - Non-récupérable & Déductible');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6170 0005', 'Régularisation Appels de fonds - Non-récupérable & Non-déductible');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6200 0000', 'Frais d''administration et honoraires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6210 0000', 'Rémunérations du syndic sur gestion copropriété');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6211 0000', 'Rémunération du syndic');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6211 0001', 'Honoraires gestion syndic');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6211 0002', 'Frais annexes syndic');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6211 0003', 'Frais ancien syndic');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6211 0004', 'Honoraires de l''Administrateur Provisoire');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6212 0000', 'Débours');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6212 0001', 'Location de salle');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6212 0002', 'Débours');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6213 0000', 'Frais postaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6213 0001', 'Frais postaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6213 0002', 'Affranchissements');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6220 0000', 'Autres honoraires du syndic');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6221 0000', 'Honoraires travaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6221 0001', 'Honoraires travaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0000', 'Prestations particulières');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0001', 'Vacations complémentaires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0002', 'Réunions CS & AG complémentaires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0003', 'Démarches sur règlement & division');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0004', 'Pilotage et suivi des sinistres');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0005', 'Pilotage et suivi des contentieux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0006', 'Frais de recouvrement');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0007', 'Frais et honoraires liés aux mutations');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0008', 'Frais de reprographie sur documentation');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6222 0099', 'Prestations particulières');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6223 0000', 'Autres honoraires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6223 0001', 'Reprise de la comptabilité');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6223 0002', 'Pilotage et suivi emprunts & subventions');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6223 0099', 'Autres honoraires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6230 0000', 'Rémunérations de tiers intervenants');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6230 0001', 'Honoraires experts');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6230 0002', 'Honoraires huissiers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6230 0003', 'Honoraires avocats');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6230 0004', 'Tiers intervenant');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6240 0000', 'Frais du conseil syndical');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6300 0000', 'Impôts - taxes et versements assimilés');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6320 0000', 'Taxe de balayage');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6330 0000', 'Taxe foncière');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6330 0001', 'Taxes foncières');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6340 0000', 'Autres impôts et taxes');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6400 0000', 'Frais de personnel');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6410 0000', 'Salaires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6410 0001', 'Salaires nets - Employé d''immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6410 0002', 'Salaires nets – gardien (40%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6410 0003', 'Salaires nets – gardien (75%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6410 0004', 'Salaires nets – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0000', 'Charges sociales et organismes sociaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0001', 'Cotisations URSSAF - Employé d''immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0002', 'Cotisations URSSAF – Gardien (40%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0003', 'Cotisations URSSAF – Gardien (75%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0004', 'Cotisations URSSAF – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0007', 'Cotisations chômage - Employé d''immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0008', 'Cotisations chômage – Gardien (40%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0009', 'Cotisations chômage – Gardien (75%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0010', 'Cotisations chômage – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0011', 'Cotisations retraite - Employé d''immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0012', 'Cotisations retraite – Gardien (40%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0013', 'Cotisations retraite – Gardien (75%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0014', 'Cotisations retraite – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0021', 'Prise en charge mutuelle - Employé d''immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0022', 'Prise en charge mutuelle – Gardien (40%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0023', 'Prise en charge mutuelle – Gardien (75%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0024', 'Prise en charge mutuelle – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0031', 'Prise en charge prévoyance - Employé d''immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0032', 'Prise en charge prévoyance – Gardien (40%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0033', 'Prise en charge prévoyance – Gardien (75%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0034', 'Prise en charge prévoyance – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0041', 'Cotisations formation - Employé d''immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0042', 'Cotisations formation – Gardien (40%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0043', 'Cotisations formation – Gardien (75%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6420 0044', 'Cotisations formation – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6430 0001', 'Taxes sur les salaires - Employé d''immeuble');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6430 0002', 'Taxes sur les salaires – Gardien (40%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6430 0003', 'Taxes sur les salaires – Gardien (75%)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6430 0004', 'Taxes sur les salaires – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6440 0001', 'Médecine du travail');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6440 0002', 'Charges loge – non récupérables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6440 0005', 'Tickets restaurants');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6440 0007', 'Prime de départ à la retraite');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6600 0000', 'Charges financières des emprunts');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6610 0000', 'Remboursement d''annuités d''emprunt');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6620 0000', 'Autres charges financières et agios');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6620 0001', 'Frais bancaires');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6620 0002', 'Reliquat de répartition');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6700 0000', 'Charges pour travaux et opérations exceptionnelles');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6710 0000', 'Travaux décidés par l''assemblée générale');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6720 0000', 'Travaux urgents');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6730 0000', 'Honoraires travaux ( études techniques, diagnostics, consultations)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6770 0000', 'Pertes sur créances irrécouvrables');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6780 0000', 'Charges exceptionnelles');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6780 0001', 'Sinistre');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6780 0002', 'Perte exceptionnelle et irrécouvrable');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('6800 0000', 'Dotations aux dépréciations sur créances douteuses');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7000 0000', 'Comptes de produits');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7000 0000', 'Appels de fonds');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7010 0000', 'Provisions sur opérations courantes');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7010 0001', 'Provisions sur opérations courantes');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7020 0000', 'Provisions sur travaux de l''article 14-2 et opérations exceptionnelles');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7020 0001', 'Provisions sur travaux de l''article 14-2 et opérations exceptionnelles');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7030 0001', 'Avances');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7031 0000', 'Avances de trésorerie');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7032 0000', 'Avances travaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7033 0000', 'Autres avances');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7040 0000', 'Remboursements d''annuités d''emprunts');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7050 0000', 'Provisions sur fonds de travaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7060 0000', 'Provisions - Servitudes');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7100 0000', 'Autres produits');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7110 0000', 'Subventions');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7120 0000', 'Emprunts');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7130 0000', 'Indemnités d''assurances');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7140 0000', 'Produits divers (dont intérêts légaux dus par les copropriétaires)');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7140 0001', 'Loyers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7140 0002', 'Avantages en nature');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7140 0003', 'Intérêts légaux');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7140 0004', 'Produits divers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7140 0005', 'Perception de servitude');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7160 0000', 'Produits financiers');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7180 0000', 'Produits exceptionnels');
INSERT INTO "accounting_plan" ("compte_num", "compte_lib") VALUES ('7800 0000', 'Reprises de dépréciations sur créances douteuses');

-- CRÉATION DU COMPTE CLIENT PAR DÉFAUT
DO $$
    DECLARE new_customer_id integer;
BEGIN
    INSERT INTO accounts_customer (name, module, status, creation_date) VALUES ('Splitter - Compte client par défaut', 'splitter', 'OK', '2023-01-09 11:26:38.989482') RETURNING id INTO new_customer_id;
    UPDATE inputs SET customer_id = new_customer_id WHERE module = 'splitter';
END $$;

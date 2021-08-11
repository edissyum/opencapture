-- CRÉATION DES STATUS
INSERT INTO "status" ("id","label","label_long") VALUES ('NEW','À valider','À valider');
INSERT INTO "status" ("id","label","label_long") VALUES ('END','Cloturée','Facture validée et cloturée');
INSERT INTO "status" ("id","label","label_long") VALUES ('ERR','Erreur','Erreur lors de la qualification');
INSERT INTO "status" ("id","label","label_long") VALUES ('WAIT_SUP','En attente','En attente validation fournisseur');
INSERT INTO "status" ("id","label","label_long") VALUES ('DEL','Supprimée','Supprimée');

-- CRÉATION DES ROLES
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (1, 'superadmin', 'SuperUtilisateur', 'false');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (2, 'admin', 'Administrateur', 'true');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (3, 'user', 'Utilisateur', 'true');
ALTER SEQUENCE "roles_id_seq" RESTART WITH 4;

-- CRÉATION DES CHAINES SORTANTES
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "data") VALUES (1, 'export_xml', 'Export XML', '{"options": {"auth": [], "parameters": [{"id": "folder_out", "type": "text", "label": "Dossier de sortie", "required": "true", "placeholder": "/var/share/sortant"}, {"id": "separator", "type": "text", "label": "Séparateur", "required": "true", "placeholder": "_"}, {"id": "filename", "hint": "Liste des identifiants techniques, séparés par #", "type": "text", "label": "Nom du fichier", "required": "true", "placeholder": "invoice_number#order_number#supplier_name"}]}}');
INSERT INTO "outputs_types" ("id", "output_type_id", "output_type_label", "data") VALUES (2, 'export_maarch', 'Export vers Maarch', '{"options": {
        "auth": [
            {
                "id": "host",
                "type": "text",
                "label": "URL de l''hôte",
                "required": "true",
                "placeholder": "http://localhost/maarch_courrier/rest/"
            },
            {
                "id": "login",
                "type": "text",
                "label": "Pseudo de l''utilisateur WS",
                "required": "true",
                "placeholder": "edissyumws"
            },
            {
                "id": "password",
                "type": "password",
                "label": "Mot de passe de l''utilisateur WS",
                "required": "true",
                "placeholder": "maarch"
            }
        ],
        "parameters": [
            {
                "id": "status",
                "type": "text",
                "label": "Status",
                "required": "true",
                "webservice": "getStatusesFromMaarch",
                "placeholder": "Courrier à qualifier"
            },
            {
                "id": "statusEnd",
                "type": "text",
                "label": "Status clos",
                "required": "true",
                "webservice": "getStatusesFromMaarch",
                "placeholder": "Clos / fin du workflow"
            },
            {
                "id": "typeId",
                "type": "text",
                "label": "Type de document",
                "required": "true",
                "webservice": "getDoctypesFromMaarch",
                "placeholder": "Facture à qualifier"
            },
            {
                "id": "typist",
                "type": "text",
                "label": "Utilisateur Rédacteur",
                "required": "true",
                "webservice": "getUsersFromMaarch",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "priority",
                "type": "text",
                "label": "Priorité",
                "required": "true",
                "webservice": "getPrioritiesFromMaarch",
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
                "label": "Identifiant du modèle d''enregistrement",
                "required": "true",
                "webservice": "getIndexingModelsFromMaarch",
                "placeholder": "Facture"
            },
            {
                "id": "destination",
                "type": "text",
                "label": "Identifiant de l''entité destinatrice",
                "required": "true",
                "webservice": "getEntitiesFromMaarch",
                "placeholder": "Service Courrier"
            },
            {
                "id": "destUser",
                "type": "text",
                "label": "Identifiant de l''utilisateur destinataire",
                "required": "true",
                "webservice": "getUsersFromMaarch",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "customFields",
                "hint": "La valeur doit être de type JSON avec des doubles quotes \". La clé est l''identifiant du custom Maarch, la valeur est l''identifiant du champ Open-Capture",
                "type": "text",
                "label": "Champs personnalisés",
                "isJson": "true",
                "required": "false",
                "placeholder": "{\"1\": \"invoice_number\", \"2\": \"order_number\"}"}]}}'
);
ALTER SEQUENCE "outputs_types_id_seq" RESTART WITH 3;

INSERT INTO "outputs" ("id", "output_type_id", "output_label", "data") VALUES (1, 'export_xml', 'Export XML par défaut');
INSERT INTO "outputs" ("id", "output_type_id", "output_label", "data") VALUES (2, 'export_maarch', 'Export Maarch par défaut');
ALTER SEQUENCE "outputs_id_seq" RESTART WITH 3;

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
INSERT INTO "privileges" ("id", "label", "parent") VALUES (12, 'custom_fields', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (13, 'version_update', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (14, 'forms_list', 'verifier');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (15, 'form_builder', 'verifier');
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
ALTER SEQUENCE "privileges_id_seq" RESTART WITH 26;

-- AJOUT DES PRIVILEGES LIÉS AUX ROLES
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (1, '{"data" : "[''*'']"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (2, '{"data" : "[1, 2, 3, 4, 5, 6, 7, 8, 9]"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (3, '{"data" : "[2, 3, 6, 7, 8, 9]"}');

-- CRÉATION DU FORMMULAIRE PAR DÉFAUT
INSERT INTO "form_models" (id, label, default_form, enabled) VALUES (1, 'Formulaire par défaut', true, true);
ALTER SEQUENCE "form_models_id_seq" RESTART WITH 2;

-- CRÉATION DES CHAMPS POUR LE FORMULAIRE PAR DÉFAUT
INSERT INTO "form_models_field" (id, form_id, fields) VALUES (1, 1, '{"other": [], "supplier": [{"id": "name", "type": "text", "unit": "supplier", "class": "w-full", "color": "white", "label": "ACCOUNTS.supplier_name", "format": "alphanum", "display": "simple", "required": true, "class_label": "1", "format_icon": "fas fa-hashtag", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "address1", "type": "text", "unit": "addresses", "class": "w-1/2", "label": "ADDRESSES.address_1", "format": "alphanum", "display": "simple", "required": true, "class_label": "1/2", "format_icon": "fas fas fa-hashtag", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "address2", "type": "text", "unit": "addresses", "class": "w-1/2", "label": "ADDRESSES.address_2", "format": "alphanum", "display": "simple", "required": false, "class_label": "1/2", "format_icon": "fas fas fa-hashtag", "display_icon": "fas fa-file-alt", "required_icon": "far fa-star"}, {"id": "postal_code", "type": "text", "unit": "addresses", "class": "w-1/3", "label": "ADDRESSES.postal_code", "format": "number_int", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "city", "type": "text", "unit": "addresses", "class": "w-1/3", "label": "ADDRESSES.city", "format": "char", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-font", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "country", "type": "text", "unit": "addresses", "class": "w-1/3", "label": "ADDRESSES.country", "format": "char", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-font", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "vat_number", "type": "text", "unit": "supplier", "class": "w-1/3", "color": "olive", "label": "ACCOUNTS.vat_number", "format": "alphanum", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fas fa-hashtag", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "siren", "type": "text", "unit": "supplier", "class": "w-1/3", "color": "lime", "label": "ACCOUNTS.siren", "format": "number_int", "display": "simple", "required": false, "class_label": "1/33", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-file-alt", "required_icon": "far fa-star"}, {"id": "siret", "type": "text", "unit": "supplier", "class": "w-1/3", "color": "green", "label": "ACCOUNTS.siret", "format": "number_int", "display": "simple", "required": false, "class_label": "1/33", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-file-alt", "required_icon": "far fa-star"}], "facturation": [{"id": "delivery_number", "type": "text", "unit": "facturation", "class": "w-1/2", "color": "orange", "label": "FACTURATION.delivery_number", "format": "alphanum_extended", "display": "multi", "required": false, "class_label": "1/2", "format_icon": "fas fa-hashtag fa-level-up-alt", "display_icon": "fas fa-layer-group", "required_icon": "far fa-star"}, {"id": "order_number", "type": "text", "unit": "facturation", "class": "w-1/2", "color": "yellow", "label": "FACTURATION.order_number", "format": "alphanum_extended", "display": "multi", "required": false, "class_label": "1/2", "format_icon": "fas fa-hashtag fa-level-up-alt", "display_icon": "fas fa-layer-group", "required_icon": "far fa-star"}, {"id": "invoice_number", "type": "text", "unit": "facturation", "class": "w-1/3", "color": "red", "label": "FACTURATION.invoice_number", "format": "alphanum", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-hashtag", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "invoice_date", "type": "date", "unit": "facturation", "class": "w-1/3", "color": "aqua", "label": "FACTURATION.invoice_date", "format": "date", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "fas fa-calendar-day", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "invoice_due_date", "type": "date", "unit": "facturation", "class": "w-1/3", "color": "blue", "label": "FACTURATION.invoice_due_date", "format": "date", "display": "simple", "required": false, "class_label": "1/33", "format_icon": "fas fa-calendar-day", "display_icon": "fas fa-file-alt", "required_icon": "far fa-star"}, {"id": "vat_rate", "type": "text", "unit": "facturation", "class": "w-1/4", "color": "pink", "label": "FACTURATION.vat_rate", "format": "number_float", "display": "multi", "required": true, "class_label": "1/4", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-layer-group", "required_icon": "fas fa-star"}, {"id": "no_rate_amount", "type": "text", "unit": "facturation", "class": "w-1/4", "color": "fuchsia", "label": "FACTURATION.no_rate_amount", "format": "number_float", "display": "multi", "required": true, "class_label": "1/4", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-layer-group", "required_icon": "fas fa-star"}, {"id": "vat_amount", "type": "text", "unit": "facturation", "class": "w-1/4", "color": "purple", "label": "FACTURATION.vat_amount", "format": "number_float", "display": "multi", "required": true, "class_label": "1/4", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-layer-group", "required_icon": "fas fa-star"}, {"id": "accounting_plan", "type": "select", "unit": "facturation", "class": "w-1/4", "label": "FACTURATION.accounting_plan", "required": false, "class_label": "1/4", "required_icon": "far fa-star"}, {"id": "total_vat", "type": "text", "unit": "facturation", "class": "w-1/3", "color": "", "label": "FACTURATION.total_vat", "format": "number_float", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "total_ttc", "type": "text", "unit": "facturation", "class": "w-1/3", "label": "FACTURATION.total_ttc", "format": "number_float", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}, {"id": "total_ht", "type": "text", "unit": "facturation", "class": "w-1/3", "label": "FACTURATION.total_ht", "format": "number_float", "display": "simple", "required": true, "class_label": "1/33", "format_icon": "text-lg icomoon-numbers", "display_icon": "fas fa-file-alt", "required_icon": "fas fa-star"}]}');
ALTER SEQUENCE "form_models_field_id_seq" RESTART WITH 2;

-- CRÉATION DE L'UTILISATEUR superadmin
INSERT INTO "users" ("username","firstname", "lastname","password", "role") VALUES ('admin', 'Super', 'ADMIN', 'pbkdf2:sha256:150000$7c8waI7f$c0891ac8e18990db0786d4a49aea8bf7c1ad82796dccd8ae35c12ace7d8ee403', 1);
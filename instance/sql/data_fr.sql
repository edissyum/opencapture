-- CREATE STATUS
INSERT INTO "status" ("id","label","label_long") VALUES ('NEW','À valider','À valider');
INSERT INTO "status" ("id","label","label_long") VALUES ('END','Cloturée','Facture validée et cloturée');
INSERT INTO "status" ("id","label","label_long") VALUES ('ERR','Erreur','Erreur lors de la qualification');
INSERT INTO "status" ("id","label","label_long") VALUES ('WAIT_SUP','En attente','En attente validation fournisseur');
INSERT INTO "status" ("id","label","label_long") VALUES ('DEL','Supprimée','Supprimée');

-- CREATE ROLES
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (1, 'superadmin', 'SuperUtilisateur', 'false');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (2, 'admin', 'Administrateur', 'true');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (3, 'user', 'Utilisateur', 'true');

-- CREATE PRIVILEGES
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

-- ADD PRIVILEGES TO ROLES
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (1, '{"data" : "[''*'']"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (2, '{"data" : "[1, 2, 3, 4, 5, 6, 7, 8, 9]"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (3, '{"data" : "[2, 3, 6, 7, 8, 9]"}');

-- ADD DEFAULT FORM
INSERT INTO "form_models" (id, label, "default", enabled) VALUES (1, 'Formulaire par défaut', true, true);

-- GENERATE DEFAULT FORM FIELD
INSERT INTO "form_models_field" (id, form_id, fields) VALUES (1, 1, '{"accounts": [{"id": "name", "type": "text", "unit": "accounts", "class": "w-full", "label": "ACCOUNTS.name", "required": true}, {"id": "address2", "type": "text", "unit": "addresses", "class": "w-1/2", "label": "ADDRESSES.address_2", "required": true}, {"id": "address1", "type": "text", "unit": "addresses", "class": "w-1/2", "label": "ADDRESSES.address_1", "required": true}, {"id": "postal_code", "type": "text", "unit": "addresses", "class": "w-1/5", "label": "ADDRESSES.postal_code", "required": true}, {"id": "city", "type": "text", "unit": "addresses", "class": "w-1/2", "label": "ADDRESSES.city", "required": true}, {"id": "country", "type": "text", "unit": "addresses", "class": "w-30", "label": "ADDRESSES.country", "required": true}, {"id": "vat_number", "type": "text", "unit": "accounts", "class": "w-full", "label": "ACCOUNTS.vat_number", "required": true}, {"id": "siret", "type": "text", "unit": "accounts", "class": "w-1/2", "label": "ACCOUNTS.siret", "required": false}, {"id": "siren", "type": "text", "unit": "accounts", "class": "w-1/2", "label": "ACCOUNTS.siren", "required": false}], "facturation": [{"id": "delivery_number", "type": "text", "unit": "facturation", "class": "w-1/2", "label": "FACTURATION.delivery_number", "required": true}, {"id": "order_number", "type": "text", "unit": "facturation", "class": "w-1/2", "label": "FACTURATION.order_number", "required": true}, {"id": "invoice_number", "type": "text", "unit": "facturation", "class": "w-1/2", "label": "FACTURATION.invoice_number", "required": true}, {"id": "invoice_date", "type": "date", "unit": "facturation", "class": "w-1/4", "label": "FACTURATION.invoice_date", "required": true}, {"id": "invoice_due_date", "type": "date", "unit": "facturation", "class": "w-1/4", "label": "FACTURATION.invoice_due_date", "required": true}, {"id": "vat_rate", "type": "text", "unit": "facturation", "class": "w-1/4", "label": "FACTURATION.vat_rate", "required": true}, {"id": "no_rate_amount", "type": "text", "unit": "facturation", "class": "w-1/4", "label": "FACTURATION.no_rate_amount", "required": true}, {"id": "vat_amount", "type": "text", "unit": "facturation", "class": "w-1/4", "label": "FACTURATION.vat_amount", "required": true}, {"id": "accounting_plan", "type": "select", "unit": "facturation", "class": "w-1/4", "label": "FACTURATION.accounting_plan", "required": true}, {"id": "total_ttc", "type": "text", "unit": "facturation", "class": "w-1/3", "label": "FACTURATION.total_ttc", "required": true}, {"id": "total_ht", "type": "text", "unit": "facturation", "class": "w-1/3", "label": "FACTURATION.total_ht", "required": true}, {"id": "total_vat", "type": "text", "unit": "facturation", "class": "w-1/3", "label": "FACTURATION.total_vat", "required": true}]}')

-- CREATE SUPERADMIN user
INSERT INTO "users" ("username","firstname", "lastname","password", "role") VALUES ('admin', 'Super', 'ADMIN', 'pbkdf2:sha256:150000$7c8waI7f$c0891ac8e18990db0786d4a49aea8bf7c1ad82796dccd8ae35c12ace7d8ee403', 1);
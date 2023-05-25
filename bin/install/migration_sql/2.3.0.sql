-- Improve user table security
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Improve inputs
ALTER TABLE inputs ADD COLUMN "allow_automatic_validation" BOOLEAN DEFAULT False;
ALTER TABLE inputs ADD COLUMN "automatic_validation_data" TEXT DEFAULT '';
DELETE FROM configurations WHERE label = 'allowAutomaticValidation';
INSERT INTO "configurations" ("label", "data") VALUES ('devisSizeMin', '{"type": "int", "value": "3", "description": "Taille minimale pour un numéro de devis"}');

-- Add LDAP
CREATE TABLE "login_methods"
(
    "id"            SERIAL      UNIQUE PRIMARY KEY,
    "method_name"   VARCHAR(64) UNIQUE,
    "method_label"  VARCHAR(255),
    "enabled"       BOOLEAN     DEFAULT FALSE,
    "data"          JSONB       DEFAULT '{}'
);
INSERT INTO "login_methods" ("method_name", "method_label", "enabled", "data") VALUES ('default', 'Authentification par defaut', True, '{}');
INSERT INTO "login_methods" ("method_name", "method_label", "enabled", "data") VALUES ('ldap', 'Authentification par LDAP', False, '{"host": "", "port": "", "baseDN": "", "suffix": "","prefix": "", "typeAD": "", "usersDN": "", "classUser": "", "loginAdmin": "", "classObject": "", "passwordAdmin": "", "attributLastName": "", "attributFirstName": "", "attributSourceUser": "", "attributRoleDefault": ""}');

-- Improve REGEX
UPDATE regex SET content = '(((?P<r1>NUMERO|N(O|°|º|R.))?\s*(DE)?\s*(DEVIS)(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?|(R(E|É)F(\.)?\s*PROPOSITION\s*COMMERCIALE))\s*(:|#){0,1}).*' WHERE lang = 'fra' AND regex_id = 'quotationRegex';
UPDATE regex SET content = '(?P<r1>MONTANT\s*(NET)?|(SOUS(-|\s+)?)TOTAL|VAT\s*BASE|VALEUR\s*(BRUTE|POSITIONS|NETTE\s*TOTALE)|IMPOSABLE|TOTAL(S)?\s*DES\s*DIVERS\s*(À|A)\s*VENTILER|PRIX\s*NET\s*(TOTAL)?|TOTAL\s*(ORDRE|NET|INTERM(E|É)DIAIRE)|BASE\s*TOTAL)?\s*(:\s*|EN)?(€|EUROS|EUR)?\s*(?(r1)()|(\()?((H(\.)?T(\.)?(V(\.)?A(\.)?)?|HORS TVA|(EXCL|BASE)\s*(\.)?\s*TVA|HORS\s*TAXES|TOTAL\s*INTERM(É|E)DIAIRE))(\))?){1}\s*(:)?(€|EUROS|EUR)?\s*([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR)?|([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€)?\s*(HT)' WHERE lang = 'fra' AND regex_id = 'noRatesRegex';
UPDATE regex SET content = '(?P<r1>MONTANT|^\s*TOTAL)?\s*(:\s*)?(€|EUROS|EUR)?\s*(?(r1)()|(T(.)?T(.)?C|\(TVA COMPRISE\)|TVAC|TVA\s*INCLUSE|(MONTANT)?NET\s*(À|A)\s*(PAYER|VERSER))){1}(\s*(À|A)\s*PAYER)?\s*(:|(€|EUROS|EUR))?\s*([0-9]*(\.?\,?\|?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR)?' WHERE lang = 'fra' AND regex_id = 'allRatesRegex';
UPDATE regex SET content = '((MONTANT|TOTAL|DONT)\s*TVA(\s*[0-9.,]*\s*%)?(\s*\(SUR\s*FACTURE\s*\))?|TVA\s*[0-9.,]*\s*%|TVA\s*[0-9.,]*\s*%?\s*SUR\s*[0-9.,]*\s*[A-Z\s'']*|%\s*TVA)\s*(€|EUROS|EUR)?.*' WHERE lang = 'fra' AND regex_id = 'vatAmountRegex';

-- Update privileges to fix bad parent association
TRUNCATE TABLE privileges;
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
ALTER SEQUENCE "privileges_id_seq" RESTART WITH 53;

-- Improve Splitter outputs
UPDATE outputs_types SET "data" = '{
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
        "id": "zip_filename",
        "hint": "Ajouter le fichier au ZIP, [Except=doctype1] mentionne les types de documents à ne pas ajouter dans le ZIP",
        "type": "text",
        "label": "Nom du fichier ZIP à exporter",
        "required": "false",
        "placeholder": "splitter-files.zip[Except=doctype1,doctype2]"
      }
    ]
  }
}' WHERE output_type_id = 'export_pdf' AND module = 'splitter';

UPDATE outputs_types SET "data" = '{
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
}' WHERE output_type_id = 'export_xml' AND module = 'splitter';

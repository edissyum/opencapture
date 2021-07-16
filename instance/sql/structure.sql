CREATE TABLE "users" (
    "id"            SERIAL UNIQUE PRIMARY KEY,
    "username"      VARCHAR(20) UNIQUE NOT NULL,
    "firstname"     VARCHAR(255)       NOT NULL,
    "lastname"      VARCHAR(255)       NOT NULL,
    "password"      VARCHAR(255)       NOT NULL,
    "enabled"       BOOLEAN    DEFAULT true,
    "status"        VARCHAR(5) DEFAULT 'OK',
    "creation_date" TIMESTAMP  DEFAULT (CURRENT_TIMESTAMP),
    "role"          INTEGER DEFAULT 3
);

CREATE TABLE "form_models" (
    "id"      SERIAL UNIQUE PRIMARY KEY,
    "label"   VARCHAR(50),
    "default_form" boolean default false,
    "enabled" boolean default true,
    "status" VARCHAR(5) default 'OK'
);

CREATE TABLE "form_models_field" (
    "id"        SERIAL UNIQUE PRIMARY KEY,
    "form_id"   INTEGER,
    "fields"    JSONB DEFAULT '{}',
);

CREATE TABLE "custom_fields" (
     "id" SERIAL PRIMARY KEY,
     "label_short" VARCHAR(10),
     "label" VARCHAR(50),
     "type" VARCHAR(10),
     "module" VARCHAR(10),
     "settings" JSONB DEFAULT '{}',
     "enabled" BOOLEAN default true,
     "status" VARCHAR(5) default 'OK'
);

CREATE TABLE "users_customers" (
    "id"           SERIAL UNIQUE PRIMARY KEY,
    "user_id"      INTEGER,
    "customers_id" JSONB DEFAULT '{}',
);

CREATE TABLE "addresses" (
    "id"            SERIAL UNIQUE PRIMARY KEY,
    "address1"      VARCHAR(255),
    "address2"      VARCHAR(255),
    "postal_code"   VARCHAR(10),
    "city"          VARCHAR(50),
    "country"       VARCHAR(50),
    "creation_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
);

CREATE TABLE "roles" (
    "id"    SERIAL UNIQUE PRIMARY KEY,
    "label_short" VARCHAR(10),
    "label" VARCHAR(20),
    "status" VARCHAR(3) DEFAULT 'OK',
    "editable" BOOLEAN DEFAULT true,
    "enabled" BOOLEAN DEFAULT true,
);

CREATE TABLE "roles_privileges" (
    "id"           SERIAL UNIQUE PRIMARY KEY,
    "role_id"      INTEGER,
    "privileges_id" JSONB DEFAULT '{}',
);

CREATE TABLE "privileges" (
    "id"    SERIAL UNIQUE PRIMARY KEY,
    "parent" VARCHAR(20),
    "label" VARCHAR(50)
);

CREATE TABLE "accounts_supplier" (
    "id"            SERIAL UNIQUE PRIMARY KEY,
    "name"          VARCHAR NOT NULL,
    "vat_number"    VARCHAR(20),
    "siret"         VARCHAR(20),
    "siren"         VARCHAR(20),
    "address_id"    INTEGER,
    "typology"      VARCHAR,
    "form_id"       INTEGER,
    "status"        VARCHAR(3) DEFAULT 'OK',
    "creation_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
    "positions"     JSONB DEFAULT '{}',
);

CREATE TABLE "accounts_customer" (
    "id"              SERIAL UNIQUE PRIMARY KEY,
    "name"            VARCHAR(255),
    "vat_number"      VARCHAR(20),
    "siret"           VARCHAR(20),
    "siren"           VARCHAR(20),
    "company_number"  VARCHAR(10),
    "accounting_plan" INTEGER,
    "address_id"      INTEGER,
    "status"          VARCHAR(3) DEFAULT 'OK',
    "creation_date"   TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
);

CREATE TABLE "accounting_plan" (
    "id"            SERIAL UNIQUE PRIMARY KEY,
    "journal_code"  VARCHAR(2),
    "journal_lib"   VARCHAR(10),
    "ecriture_num"  INTEGER,
    "ecriture_date" TIMESTAMP,
    "compte_num"    INTEGER,
    "compte_lib"    VARCHAR,
    "comp_aux_num"  VARCHAR,
    "comp_aux_lib"  VARCHAR,
    "piece_ref"     VARCHAR,
    "piece_date"    TIMESTAMP,
    "ecriture_lib"  VARCHAR
);

CREATE TABLE "journals" (
    "id"    SERIAL UNIQUE PRIMARY KEY,
    "label" VARCHAR(10)
);

CREATE TABLE "invoices" (
    "id"                    SERIAL UNIQUE PRIMARY KEY,
    "supplier_id"           INTEGER,
    "customer_id"           INTEGER,
    "purchase_or_sale"      VARCHAR(8) DEFAULT 'purchase',
    "vat_number"            VARCHAR DEFAULT NULL,
    "invoice_number"        VARCHAR(255),
    "invoice_date"          TIMESTAMP,
    "filename"              VARCHAR NOT NULL,
    "path"                  VARCHAR NOT NULL,
    "status"                VARCHAR(20)  NOT NULL DEFAULT 'NEW',
    "full_jpg_filename"     VARCHAR,
    "tiff_filename"         VARCHAR,
    "img_width"             INTEGER,
    "nb_pages"              INTEGER DEFAULT 1,
    "register_date"         TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
    "total_amount"          VARCHAR(255),
    "ht_amounts"            JSONB DEFAULT '{}',
    "vat_rates"             JSONB DEFAULT '{}',
    "footer_page"           INTEGER,
    "supplier_page"         INTEGER,
    "invoice_number_page"   INTEGER,
    "invoice_date_page"     INTEGER,
    "locked"                INTEGER NOT NULL DEFAULT 0,
    "locked_by"             VARCHAR(20),
    "processed"             INTEGER NOT NULL DEFAULT 0,
    "original_filename"     VARCHAR(255),
    "positions"             JSONB DEFAULT '{}',
);

CREATE TABLE "history" (
    "id"                 SERIAL UNIQUE PRIMARY KEY,
    "user_id"            INTEGER,
    "history_type"       VARCHAR(20),
    "history_id"         INTEGER,
    "history_invoice_id" INTEGER,
    "history_date"       TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
    "history_desc"       VARCHAR(255),
    "user_ip"            VARCHAR(12)
);

CREATE TABLE "status" (
    "id"         VARCHAR(20),
    "label"      VARCHAR(200),
    "label_long" VARCHAR(200)
);

CREATE TABLE "splitter_batches" (
    "id"                SERIAL UNIQUE PRIMARY KEY,
    "dir_name"          VARCHAR,
    "first_page"        VARCHAR,
    "image_folder_name" VARCHAR,
    "creation_date"     TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
    "status"            VARCHAR   DEFAULT 'NEW',
    "page_number"       INTEGER
);

CREATE TABLE "splitter_images" (
    "id"           SERIAL UNIQUE PRIMARY KEY,
    "batch_name"   VARCHAR,
    "image_path"   VARCHAR,
    "image_number" INTEGER,
    "status"       VARCHAR DEFAULT 'NEW'
);

CREATE TABLE "users"
(
    "id"                SERIAL      UNIQUE PRIMARY KEY,
    "username"          VARCHAR(50) UNIQUE NOT NULL,
    "firstname"         VARCHAR(255)       NOT NULL,
    "lastname"          VARCHAR(255)       NOT NULL,
    "password"          VARCHAR(255)       NOT NULL,
    "email"             TEXT,
    "enabled"           BOOLEAN     DEFAULT True,
    "status"            VARCHAR(5)  DEFAULT 'OK',
    "creation_date"     TIMESTAMP   DEFAULT (CURRENT_TIMESTAMP),
    "last_connection"   TIMESTAMP,
    "role"              INTEGER     NOT NULL
);

CREATE TABLE "form_models"
(
    "id"            SERIAL        UNIQUE PRIMARY KEY,
    "label"         VARCHAR(50),
    "default_form"  BOOLEAN       DEFAULT False,
    "enabled"       BOOLEAN       DEFAULT True,
    "outputs"       TEXT[],
    "module"        VARCHAR(10),
    "status"        VARCHAR(5)    DEFAULT 'OK',
    "settings"      JSONB         DEFAULT '{}'
);

CREATE TABLE "form_model_settings"
(
    "id"       SERIAL      UNIQUE PRIMARY KEY,
    "module"   VARCHAR(10),
    "settings" JSONB       DEFAULT '{}'
);

CREATE TABLE "positions_masks"
(
    "id"          SERIAL        UNIQUE PRIMARY KEY,
    "label"       VARCHAR(50),
    "enabled"     BOOLEAN       DEFAULT True,
    "supplier_id" INTEGER,
    "form_id"     INTEGER,
    "positions"   JSONB         DEFAULT '{}',
    "pages"       JSONB         DEFAULT '{}',
    "regex"       JSONB         DEFAULT '{}',
    "status"      VARCHAR(5)    DEFAULT 'OK',
    "filename"    VARCHAR(255),
    "width"       VARCHAR(10),
    "nb_pages"    INTEGER
);

CREATE TABLE "form_models_field"
(
    "id"      SERIAL    UNIQUE PRIMARY KEY,
    "form_id" INTEGER,
    "fields"  JSONB     DEFAULT '{}'
);

CREATE TABLE "outputs"
(
    "id"             SERIAL         UNIQUE PRIMARY KEY,
    "output_type_id" VARCHAR(255),
    "output_label"   VARCHAR(255),
    "compress_type"  VARCHAR(8),
    "ocrise"         BOOLEAN DEFAULT FALSE,
    "module"         VARCHAR(10),
    "status"         VARCHAR(3)     DEFAULT 'OK',
    "data"           JSONB          DEFAULT '{
        "options": {
            "auth": [],
            "parameters": []
        }
    }'
);

CREATE TABLE "outputs_types"
(
    "id"                SERIAL          UNIQUE PRIMARY KEY,
    "output_type_id"    VARCHAR(255),
    "output_type_label" VARCHAR(50),
    "module"            VARCHAR(10),
    "data"              JSONB           DEFAULT '{
        "options": {
            "auth": [],
            "parameters": []
        }
    }'
);

CREATE TABLE "inputs"
(
    "id"                            SERIAL         UNIQUE PRIMARY KEY,
    "input_id"                      VARCHAR(255),
    "input_label"                   VARCHAR(255),
    "default_form_id"               INTEGER,
    "customer_id"                   INTEGER,
    "module"                        VARCHAR(10),
    "remove_blank_pages"            BOOLEAN        DEFAULT False,
    "override_supplier_form"        BOOLEAN        DEFAULT False,
    "purchase_or_sale"              VARCHAR(8)     DEFAULT 'purchase',
    "status"                        VARCHAR(3)     DEFAULT 'OK',
    "input_folder"                  TEXT,
    "splitter_method_id"            VARCHAR(20)    DEFAULT 'qr_code_OC'
);

CREATE TABLE "custom_fields"
(
    "id"           SERIAL       PRIMARY KEY,
    "label_short"  VARCHAR(50),
    "metadata_key" VARCHAR(50),
    "label"        VARCHAR(50),
    "type"         VARCHAR(10),
    "module"       VARCHAR(10),
    "settings"     JSONB        DEFAULT '{}',
    "enabled"      BOOLEAN      DEFAULT True,
    "status"       VARCHAR(5)   DEFAULT 'OK'
);

CREATE TABLE "users_customers"
(
    "id"           SERIAL   UNIQUE PRIMARY KEY,
    "user_id"      INTEGER,
    "customers_id" JSONB    DEFAULT '{}'
);

CREATE TABLE "addresses"
(
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "address1"      VARCHAR(255),
    "address2"      VARCHAR(255),
    "postal_code"   VARCHAR(50),
    "city"          VARCHAR(50),
    "country"       VARCHAR(50),
    "creation_date" TIMESTAMP       DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roles"
(
    "id"          SERIAL        UNIQUE PRIMARY KEY,
    "label_short" VARCHAR(10),
    "label"       VARCHAR(20),
    "status"      VARCHAR(3)    DEFAULT 'OK',
    "editable"    BOOLEAN       DEFAULT True,
    "enabled"     BOOLEAN       DEFAULT True
);

CREATE TABLE "roles_privileges"
(
    "id"            SERIAL UNIQUE PRIMARY KEY,
    "role_id"       INTEGER,
    "privileges_id" JSONB DEFAULT '{}'
);

CREATE TABLE "privileges"
(
    "id"     SERIAL UNIQUE PRIMARY KEY,
    "parent" VARCHAR(20),
    "label"  VARCHAR(50)
);

CREATE TABLE "accounts_supplier"
(
    "id"                  SERIAL        UNIQUE PRIMARY KEY,
    "name"                VARCHAR(255)  NOT NULL,
    "vat_number"          VARCHAR(20)   UNIQUE,
    "siret"               VARCHAR(20),
    "siren"               VARCHAR(20),
    "iban"                VARCHAR(50),
    "email"               VARCHAR,
    "address_id"          INTEGER,
    "form_id"             INTEGER,
    "document_lang"       VARCHAR(10)   DEFAULT 'fra',
    "status"              VARCHAR(3)    DEFAULT 'OK',
    "get_only_raw_footer" BOOLEAN       DEFAULT False,
    "skip_auto_validate"  BOOLEAN       DEFAULT False,
    "lang"                VARCHAR(10)   DEFAULT 'fra',
    "creation_date"       TIMESTAMP     DEFAULT (CURRENT_TIMESTAMP),
    "positions"           JSONB         DEFAULT '{}',
    "pages"               JSONB         DEFAULT '{}'
);

CREATE TABLE "accounts_customer"
(
    "id"             SERIAL         UNIQUE PRIMARY KEY,
    "name"           VARCHAR(255),
    "vat_number"     VARCHAR(20)    UNIQUE,
    "siret"          VARCHAR(20),
    "siren"          VARCHAR(20),
    "company_number" VARCHAR(10),
    "address_id"     INTEGER,
    "module"         VARCHAR(10),
    "status"         VARCHAR(3)     DEFAULT 'OK',
    "creation_date"  TIMESTAMP      DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "accounting_plan"
(
    "id"            SERIAL UNIQUE PRIMARY KEY,
    "customer_id"   INTEGER,
    "journal_code"  VARCHAR(2),
    "journal_lib"   VARCHAR(10),
    "ecriture_num"  INTEGER,
    "ecriture_date" TIMESTAMP,
    "compte_num"    VARCHAR(20),
    "compte_lib"    VARCHAR,
    "comp_aux_num"  VARCHAR,
    "comp_aux_lib"  VARCHAR,
    "piece_ref"     VARCHAR,
    "piece_date"    TIMESTAMP,
    "ecriture_lib"  VARCHAR
);

CREATE TABLE "invoices"
(
    "id"                SERIAL              UNIQUE PRIMARY KEY,
    "supplier_id"       INTEGER,
    "customer_id"       INTEGER             DEFAULT 0,
    "form_id"           INTEGER             DEFAULT null,
    "purchase_or_sale"  VARCHAR(8)          DEFAULT 'purchase',
    "filename"          VARCHAR(255)        NOT NULL,
    "original_filename" VARCHAR(255),
    "path"              VARCHAR(255)        NOT NULL,
    "status"            VARCHAR(20)         NOT NULL DEFAULT 'NEW',
    "full_jpg_filename" VARCHAR(255),
    "img_width"         INTEGER,
    "register_date"     TIMESTAMP           DEFAULT (CURRENT_TIMESTAMP),
    "nb_pages"          INTEGER             NOT NULL DEFAULT 1,
    "locked"            BOOLEAN             DEFAULT False,
    "locked_by"         VARCHAR(20),
    "positions"         JSONB               DEFAULT '{}',
    "pages"             JSONB               DEFAULT '{}',
    "datas"             JSONB               DEFAULT '{}'
);

CREATE TABLE "history"
(
    "id"                SERIAL      UNIQUE PRIMARY KEY,
    "history_date"      TIMESTAMP   DEFAULT (CURRENT_TIMESTAMP),
    "history_module"    VARCHAR(50),
    "history_submodule" VARCHAR(50),
    "history_desc"      VARCHAR(255),
    "user_ip"           VARCHAR(20),
    "user_info"         VARCHAR(255),
    "user_id"           INTEGER
);

CREATE TABLE "status"
(
    "id"         VARCHAR(20),
    "label"      VARCHAR(200),
    "label_long" VARCHAR(200),
    "module"     VARCHAR(10)
);

CREATE TABLE "splitter_batches"
(
    "id"                SERIAL          UNIQUE PRIMARY KEY,
    "file_path"         VARCHAR(255),
    "file_name"         VARCHAR(255),
    "thumbnail"         VARCHAR(255),
    "batch_folder"      VARCHAR(255),
    "creation_date"     TIMESTAMP       DEFAULT (CURRENT_TIMESTAMP),
    "status"            VARCHAR(20)     DEFAULT 'NEW',
    "documents_count"   INTEGER,
    "form_id"           INTEGER,
    "customer_id"       INTEGER,
    "data"              JSON            DEFAULT '{}'::json
);

CREATE TABLE "splitter_documents"
(
    "id"            SERIAL      UNIQUE PRIMARY KEY,
    "batch_id"      INTEGER     NOT NULL,
    "split_index"   INTEGER     NOT NULL,
    "display_order" INTEGER,
    "status"        VARCHAR(10) DEFAULT 'NEW':: CHARACTER VARYING,
    "doctype_key"   VARCHAR(200),
    "data"          JSON        DEFAULT '{}'::json
);


CREATE TABLE "splitter_pages"
(
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "document_id"   INTEGER,
    "thumbnail"     VARCHAR(255),
    "source_page"   INTEGER,
    "rotation"      INTEGER         DEFAULT 0,
    "status"        VARCHAR(255)    DEFAULT 'NEW'
);

create table "doctypes"
(
    "id"         SERIAL         UNIQUE PRIMARY KEY,
    "key"        VARCHAR(255)   NOT NULL,
    "label"      VARCHAR(255),
    "code"       VARCHAR(255),
    "is_default" BOOLEAN        DEFAULT False,
    "status"     VARCHAR(3)     DEFAULT 'OK':: CHARACTER VARYING,
    "type"       VARCHAR(10),
    "form_id"    INTEGER
);

CREATE TABLE "metadata"
(
    "id"            SERIAL      UNIQUE PRIMARY KEY,
    "external_id"   VARCHAR(20),
    "last_edit"     DATE        DEFAULT now(),
    "type"          VARCHAR(20),
    "form_id"       INTEGER,
    "data"          JSONB
);

CREATE TABLE "configurations"
(
    "id"        SERIAL      UNIQUE PRIMARY KEY,
    "label"     VARCHAR(64) UNIQUE,
    "data"      JSONB       DEFAULT '{}',
    "display"   BOOLEAN     DEFAULT true
);

CREATE TABLE "docservers"
(
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "description"   VARCHAR(255),
    "docserver_id"  VARCHAR(32)     UNIQUE,
    "path"          VARCHAR(255)    UNIQUE
);

CREATE TABLE "regex"
(
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "regex_id"      VARCHAR(20),
    "label"         VARCHAR(255),
    "content"       TEXT,
    "lang"          VARCHAR(10)     DEFAULT 'fra'
);

CREATE TABLE "login_methods"
(
    "id"            SERIAL      UNIQUE PRIMARY KEY,
    "method_name"   VARCHAR(64) UNIQUE,
    "method_label"  VARCHAR(255),
    "enabled"       BOOLEAN     DEFAULT False,
    "data"          JSONB       DEFAULT '{}'
);

CREATE TABLE "languages"
(
    "language_id"       VARCHAR(5) UNIQUE PRIMARY KEY,
    "label"             VARCHAR(20),
    "lang_code"         VARCHAR(5),
    "moment_lang_code"  VARCHAR(10),
    "date_format"       VARCHAR(20)
);

create table tasks_watcher
(
    "id"                SERIAL      UNIQUE PRIMARY KEY,
    "title"             VARCHAR(255),
    "type"              VARCHAR(10),
    "module"            VARCHAR(10),
    "status"            VARCHAR(10),
    "error_description" TEXT,
    "creation_date"     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "end_date"          TIMESTAMP
);

CREATE TABLE mailcollect (
     "id"                            SERIAL       UNIQUE PRIMARY KEY,
     "name"                          VARCHAR(255) UNIQUE NOT NULL,
     "hostname"                      VARCHAR(255) NOT NULL,
     "port"                          INTEGER      NOT NULL,
     "login"                         VARCHAR(255) NOT NULL,
     "password"                      VARCHAR(255) NOT NULL,
     "secured_connection"            BOOLEAN      DEFAULT True,
     "status"                        VARCHAR(10)  DEFAULT 'OK',
     "is_splitter"                   BOOLEAN      DEFAULT False,
     "enabled"                       BOOLEAN      DEFAULT True,
     "splitter_technical_input_id"   VARCHAR(255),
     "folder_to_crawl"               VARCHAR(255) NOT NULL,
     "folder_destination"            VARCHAR(255) NOT NULL,
     "folder_trash"                  VARCHAR(255),
     "action_after_process"          VARCHAR(255) NOT NULL,
     "verifier_customer_id"          INTEGER,
     "verifier_form_id"              INTEGER
);

CREATE SEQUENCE splitter_referential_call_count AS INTEGER;
COMMENT ON SEQUENCE splitter_referential_call_count IS 'Splitter referential demand number count';

CREATE TABLE ai_models
(
    "id"                SERIAL       PRIMARY KEY,
    "model_path"        VARCHAR(50),
    "type"              VARCHAR(15),
    "train_time"        REAL,
    "accuracy_score"    REAL,
    "min_proba"         INTEGER,
    "status"            VARCHAR(10)  DEFAULT 'OK',
    "documents"         JSONB        DEFAULT '{}',
    "module"            VARCHAR(10)
);
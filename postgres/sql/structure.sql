CREATE EXTENSION IF NOT EXISTS "unaccent";

CREATE TABLE "users" (
    "id"                SERIAL          UNIQUE PRIMARY KEY,
    "username"          VARCHAR(50)     UNIQUE NOT NULL,
    "firstname"         VARCHAR(255)    NOT NULL,
    "lastname"          VARCHAR(255)    NOT NULL,
    "password"          VARCHAR(255)    NOT NULL,
    "creation_date"     TIMESTAMP       DEFAULT (CURRENT_TIMESTAMP),
    "enabled"           BOOLEAN         DEFAULT True,
    "status"            VARCHAR(20)     DEFAULT 'OK',
    "mode"              VARCHAR(10)     DEFAULT 'standard',
    "role"              INTEGER         NOT NULL,
    "last_connection"   TIMESTAMP,
    "email"             TEXT,
    "refresh_token"     TEXT,
    "reset_token"       TEXT
);

CREATE TABLE "form_models" (
    "id"            SERIAL        UNIQUE PRIMARY KEY,
    "label"         VARCHAR(50),
    "default_form"  BOOLEAN       DEFAULT False,
    "enabled"       BOOLEAN       DEFAULT True,
    "outputs"       TEXT[],
    "module"        VARCHAR(10),
    "status"        VARCHAR(20)   DEFAULT 'OK',
    "settings"      JSONB         DEFAULT '{}',
    "labels"        JSONB         DEFAULT '{}'
);

CREATE TABLE "form_model_settings" (
    "id"       SERIAL      UNIQUE PRIMARY KEY,
    "module"   VARCHAR(10),
    "settings" JSONB       DEFAULT '{}'
);

CREATE TABLE "positions_masks" (
    "id"          SERIAL        UNIQUE PRIMARY KEY,
    "label"       VARCHAR(50),
    "enabled"     BOOLEAN       DEFAULT True,
    "supplier_id" INTEGER,
    "form_id"     INTEGER,
    "positions"   JSONB         DEFAULT '{}',
    "pages"       JSONB         DEFAULT '{}',
    "regex"       JSONB         DEFAULT '{}',
    "status"      VARCHAR(20)   DEFAULT 'OK',
    "filename"    VARCHAR(255),
    "width"       VARCHAR(10),
    "nb_pages"    INTEGER,
    FOREIGN KEY (form_id) REFERENCES form_models(id) ON DELETE CASCADE
);

CREATE TABLE "form_models_field" (
    "id"      SERIAL    UNIQUE PRIMARY KEY,
    "form_id" INTEGER,
    "fields"  JSONB     DEFAULT '{}',
    FOREIGN KEY (form_id) REFERENCES form_models(id) ON DELETE CASCADE
);

CREATE TABLE "outputs" (
    "id"             SERIAL         UNIQUE PRIMARY KEY,
    "output_type_id" VARCHAR(255),
    "output_label"   VARCHAR(255),
    "compress_type"  VARCHAR(12),
    "ocrise"         BOOLEAN        DEFAULT FALSE,
    "module"         VARCHAR(10),
    "status"         VARCHAR(20)    DEFAULT 'OK',
    "data"           JSONB          DEFAULT '{
        "options": {
            "auth": [],
            "parameters": []
        }
    }'
);

CREATE TABLE "outputs_types" (
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

CREATE TABLE "custom_fields" (
    "id"           SERIAL       PRIMARY KEY,
    "label_short"  VARCHAR(50),
    "metadata_key" VARCHAR(50),
    "label"        VARCHAR(50),
    "type"         VARCHAR(10),
    "module"       VARCHAR(10),
    "settings"     JSONB        DEFAULT '{}',
    "status"       VARCHAR(20)  DEFAULT 'OK'
);

CREATE TABLE "users_customers" (
    "id"           SERIAL   UNIQUE PRIMARY KEY,
    "user_id"      INTEGER,
    "customers_id" JSONB    DEFAULT '{}'
);

CREATE TABLE "users_forms" (
    "id"       SERIAL   UNIQUE PRIMARY KEY,
    "user_id"  INTEGER,
    "forms_id" JSONB    DEFAULT '{}'
);

CREATE TABLE "addresses" (
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "address1"      VARCHAR(255),
    "address2"      VARCHAR(255),
    "postal_code"   VARCHAR(50),
    "city"          VARCHAR(50),
    "country"       VARCHAR(50),
    "creation_date" TIMESTAMP       DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "roles" (
    "id"            SERIAL        UNIQUE PRIMARY KEY,
    "label_short"   VARCHAR(255),
    "label"         VARCHAR(255),
    "status"        VARCHAR(20)   DEFAULT 'OK',
    "editable"      BOOLEAN       DEFAULT True,
    "assign_roles"  JSONB         DEFAULT '[]',
    "default_route" VARCHAR(255)
);

CREATE TABLE "roles_privileges" (
    "id"            SERIAL UNIQUE PRIMARY KEY,
    "role_id"       INTEGER,
    "privileges_id" JSONB DEFAULT '{}'
);

CREATE TABLE "privileges" (
    "id"     SERIAL UNIQUE PRIMARY KEY,
    "parent" VARCHAR(20),
    "label"  VARCHAR(50)
);

CREATE table "accounts_civilities" (
    "id"    SERIAL UNIQUE PRIMARY KEY,
    "label" VARCHAR(50)
);

CREATE TABLE "accounts_supplier" (
    "id"                        SERIAL        UNIQUE PRIMARY KEY,
    "name"                      VARCHAR(255),
    "vat_number"                VARCHAR(20)   UNIQUE,
    "siret"                     VARCHAR(20),
    "siren"                     VARCHAR(20),
    "iban"                      VARCHAR(50),
    "duns"                      VARCHAR(12)   UNIQUE,
    "bic"                       VARCHAR(11),
    "rccm"                      VARCHAR(30),
    "email"                     VARCHAR(255),
    "phone"                     VARCHAR(20),
    "address_id"                INTEGER,
    "form_id"                   INTEGER,
    "lastname"                  VARCHAR(255),
    "firstname"                 VARCHAR(255),
    "function"                  VARCHAR(255),
    "civility"                  INTEGER,
    "document_lang"             VARCHAR(10)   DEFAULT 'fra',
    "status"                    VARCHAR(20)    DEFAULT 'OK',
    "informal_contact"          BOOLEAN       DEFAULT False,
    "get_only_raw_footer"       BOOLEAN       DEFAULT False,
    "skip_auto_validate"        BOOLEAN       DEFAULT False,
    "default_currency"          VARCHAR(10),
    "default_accounting_plan"   INTEGER,
    "creation_date"             TIMESTAMP     DEFAULT (CURRENT_TIMESTAMP),
    "positions"                 JSONB         DEFAULT '{}',
    "pages"                     JSONB         DEFAULT '{}'
);

CREATE TABLE "accounts_customer" (
    "id"             SERIAL         UNIQUE PRIMARY KEY,
    "name"           VARCHAR(255),
    "vat_number"     VARCHAR(20)    UNIQUE,
    "siret"          VARCHAR(20),
    "siren"          VARCHAR(20),
    "company_number" VARCHAR(10),
    "address_id"     INTEGER,
    "module"         VARCHAR(10),
    "status"         VARCHAR(20)    DEFAULT 'OK',
    "creation_date"  TIMESTAMP      DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "accounting_plan" (
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

CREATE TABLE "workflows" (
    "id"                SERIAL       UNIQUE PRIMARY KEY,
    "workflow_id"       VARCHAR(255) NOT NULL,
    "label"             VARCHAR(255) NOT NULL,
    "module"            VARCHAR(10)  NOT NULL,
    "status"            VARCHAR(20)  DEFAULT 'OK',
    "input"             JSONB        DEFAULT '{}',
    "process"           JSONB        DEFAULT '{}',
    "output"            JSONB        DEFAULT '{}',
    CONSTRAINT          "unique_workflow_per_module" UNIQUE ("workflow_id", "module")
);

CREATE TABLE "docservers" (
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "docserver_id"  VARCHAR(32)     UNIQUE,
    "path"          VARCHAR(255),
    "description"   VARCHAR(255)
);

CREATE TABLE "documents" (
    "id"                SERIAL              UNIQUE PRIMARY KEY,
    "supplier_id"       INTEGER,
    "customer_id"       INTEGER             DEFAULT '0',
    "form_id"           INTEGER             DEFAULT NULL,
    "workflow_id"       INTEGER             DEFAULT NULL,
    "docserver_id"      VARCHAR(32)         DEFAULT NULL,
    "filename"          VARCHAR(255)        NOT NULL,
    "original_filename" VARCHAR(255),
    "path"              VARCHAR(255)        NOT NULL,
    "status"            VARCHAR(20)         NOT NULL DEFAULT 'NEW',
    "full_jpg_filename" VARCHAR(255),
    "img_width"         INTEGER,
    "facturx"           BOOLEAN             DEFAULT False,
    "facturx_level"     VARCHAR(20),
    "register_date"     TIMESTAMP           DEFAULT (CURRENT_TIMESTAMP),
    "nb_pages"          INTEGER             NOT NULL DEFAULT 1,
    "locked"            BOOLEAN             DEFAULT False,
    "locked_by"         VARCHAR(50),
    "md5"               VARCHAR(32),
    "sha256"            VARCHAR(64),
    "positions"         JSONB               DEFAULT '{}',
    "pages"             JSONB               DEFAULT '{}',
    "datas"             JSONB               DEFAULT '{}',
    FOREIGN KEY (form_id) REFERENCES form_models(id) ON DELETE SET NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES accounts_supplier(id) ON DELETE SET NULL,
    FOREIGN KEY (docserver_id) REFERENCES docservers(docserver_id) ON DELETE SET NULL
);

CREATE TABLE "history" (
    "id"                SERIAL      UNIQUE PRIMARY KEY,
    "history_date"      TIMESTAMP   DEFAULT (CURRENT_TIMESTAMP),
    "history_module"    VARCHAR(50),
    "history_submodule" VARCHAR(50),
    "history_desc"      VARCHAR(255),
    "user_ip"           VARCHAR(20),
    "user_info"         VARCHAR(255),
    "workflow_id"       INTEGER     DEFAULT null,
    "user_id"           INTEGER,
    "custom_fields"     JSONB       DEFAULT '{}'
);

CREATE TABLE "status" (
    "id"         VARCHAR(20),
    "label"      VARCHAR(200),
    "label_long" VARCHAR(200),
    "module"     VARCHAR(10),
    CONSTRAINT "status_pkey" PRIMARY KEY ("id", "module")
);

CREATE TABLE "splitter_batches" (
    "id"                SERIAL          UNIQUE PRIMARY KEY,
    "subject"           VARCHAR(255),
    "file_path"         VARCHAR(255),
    "file_name"         VARCHAR(255),
    "original_filename" VARCHAR(255),
    "thumbnail"         VARCHAR(255),
    "batch_folder"      VARCHAR(255),
    "creation_date"     TIMESTAMP       DEFAULT (CURRENT_TIMESTAMP),
    "status"            VARCHAR(20)     DEFAULT 'NEW',
    "documents_count"   INTEGER,
    "form_id"           INTEGER,
    "customer_id"       INTEGER,
    "workflow_id"       INTEGER         DEFAULT null,
    "locked"            BOOLEAN         DEFAULT False,
    "locked_by"         VARCHAR(50),
    "md5"               VARCHAR(32),
    "sha256"            VARCHAR(64),
    "data"              JSON            DEFAULT '{}'::JSON,
    FOREIGN KEY (form_id) REFERENCES form_models(id) ON DELETE SET NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES accounts_customer(id) ON DELETE SET NULL
);

CREATE TABLE "splitter_documents" (
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "batch_id"      INTEGER         NOT NULL,
    "split_index"   INTEGER         NOT NULL,
    "display_order" INTEGER,
    "status"        VARCHAR(20)     DEFAULT 'NEW',
    "doctype_key"   VARCHAR(200),
    "sha256"        VARCHAR(64),
    "md5"           VARCHAR(32),
    "data"          JSON            DEFAULT '{}'::JSON,
    FOREIGN KEY (batch_id) REFERENCES splitter_batches(id) ON DELETE CASCADE
);

CREATE TABLE "splitter_pages" (
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "document_id"   INTEGER,
    "thumbnail"     VARCHAR(255),
    "source_page"   INTEGER,
    "display_order" INTEGER,
    "rotation"      INTEGER         DEFAULT 0,
    "status"        VARCHAR(20)     DEFAULT 'NEW',
    FOREIGN KEY (document_id) REFERENCES splitter_documents(id) ON DELETE CASCADE
);

CREATE TABLE "doctypes" (
    "id"         SERIAL         UNIQUE PRIMARY KEY,
    "key"        VARCHAR(255)   NOT NULL,
    "label"      TEXT,
    "code"       VARCHAR(255),
    "is_default" BOOLEAN        DEFAULT False,
    "status"     VARCHAR(20)    DEFAULT 'OK',
    "type"       VARCHAR(10),
    "form_id"    INTEGER,
    FOREIGN KEY (form_id) REFERENCES form_models(id) ON DELETE CASCADE
);

CREATE TABLE "metadata" (
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "external_id"   VARCHAR(20),
    "last_edit"     DATE            DEFAULT now(),
    "type"          VARCHAR(20),
    "form_id"       INTEGER,
    "data"          JSONB,
    FOREIGN KEY (form_id) REFERENCES form_models(id) ON DELETE CASCADE
);

CREATE TABLE "configurations" (
    "id"        SERIAL      UNIQUE PRIMARY KEY,
    "label"     VARCHAR(64) UNIQUE,
    "data"      JSONB       DEFAULT '{}',
    "display"   BOOLEAN     DEFAULT true
);

CREATE TABLE "regex" (
    "id"            SERIAL          UNIQUE PRIMARY KEY,
    "regex_id"      VARCHAR(20),
    "label"         VARCHAR(255),
    "content"       TEXT,
    "lang"          VARCHAR(10)     DEFAULT 'fra'
);

CREATE TABLE "login_methods" (
    "id"            SERIAL      UNIQUE PRIMARY KEY,
    "method_name"   VARCHAR(64) UNIQUE,
    "method_label"  VARCHAR(255),
    "enabled"       BOOLEAN     DEFAULT False,
    "data"          JSONB       DEFAULT '{}'
);

CREATE TABLE "languages" (
    "language_id"       VARCHAR(5) UNIQUE PRIMARY KEY,
    "label"             VARCHAR(20),
    "lang_code"         VARCHAR(5),
    "moment_lang_code"  VARCHAR(10),
    "date_format"       VARCHAR(20)
);

CREATE TABLE "mailcollect" (
    "id"                            SERIAL       UNIQUE PRIMARY KEY,
    "name"                          VARCHAR(255) NOT NULL,
    "method"                        VARCHAR(20)  DEFAULT 'imap',
    "options"                       JSONB        DEFAULT '{}',
    "secured_connection"            BOOLEAN      DEFAULT True,
    "status"                        VARCHAR(20)  DEFAULT 'OK',
    "is_splitter"                   BOOLEAN      DEFAULT False,
    "enabled"                       BOOLEAN      DEFAULT True,
    "ocr_attachments"               BOOLEAN      DEFAULT False,
    "workflow_id"                   INTEGER      DEFAULT NULL,
    "folder_to_crawl"               VARCHAR(255) NOT NULL,
    "folder_destination"            VARCHAR(255) NOT NULL,
    "action_after_process"          VARCHAR(255) NOT NULL,
    "sender_custom_id"              INTEGER      DEFAULT NULL,
    "copy_custom_id"                INTEGER      DEFAULT NULL,
    "recipient_custom_id"           INTEGER      DEFAULT NULL,
    "verifier_insert_body_as_doc"   BOOLEAN      DEFAULT False,
    "splitter_insert_body_as_doc"   BOOLEAN      DEFAULT False,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
    FOREIGN KEY (copy_custom_id) REFERENCES custom_fields(id) ON DELETE SET NULL,
    FOREIGN KEY (sender_custom_id) REFERENCES custom_fields(id) ON DELETE SET NULL,
    FOREIGN KEY (recipient_custom_id) REFERENCES custom_fields(id) ON DELETE SET NULL
);

CREATE SEQUENCE splitter_referential_call_count AS INTEGER;
COMMENT ON SEQUENCE splitter_referential_call_count IS 'Splitter referential demand number count';

CREATE TABLE "ai_models" (
    "id"                SERIAL       PRIMARY KEY,
    "model_label"       VARCHAR(255),
    "model_path"        VARCHAR(50),
    "type"              VARCHAR(15),
    "train_time"        REAL,
    "accuracy_score"    REAL,
    "min_proba"         INTEGER,
    "status"            VARCHAR(20)  DEFAULT 'OK',
    "percentage"        VARCHAR(10),
    "documents"         JSONB        DEFAULT '[]',
    "module"            VARCHAR(10)
);

CREATE TABLE "monitoring" (
    "id"                 SERIAL         UNIQUE PRIMARY KEY,
    "token"              VARCHAR(255),
    "workflow_id"        INTEGER        DEFAULT null,
    "status"             VARCHAR(20),
    "elapsed_time"       VARCHAR(20),
    "document_ids"       INTEGER[],
    "error"              BOOLEAN        DEFAULT False,
    "retry"              BOOLEAN        DEFAULT False,
    "module"             VARCHAR(10)    NOT NULL,
    "source"             VARCHAR(10)    NOT NULL,
    "creation_date"      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date"           TIMESTAMP,
    "filename"           VARCHAR(255),
    "steps"              JSONB          DEFAULT '{}'
);

CREATE TABLE "attachments" (
    "id"                SERIAL          UNIQUE PRIMARY KEY,
    "document_id"       INTEGER,
    "batch_id"          INTEGER,
    "docserver_id"      VARCHAR(32)     DEFAULT NULL,
    "filename"          VARCHAR(255),
    "path"              VARCHAR(255),
    "thumbnail_path"    VARCHAR(255),
    "status"            VARCHAR(20)     DEFAULT 'OK',
    "creation_date"     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES splitter_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (docserver_id) REFERENCES docservers(docserver_id) ON DELETE SET NULL
);

CREATE TABLE "ai_llm" (
    "id"           SERIAL       UNIQUE PRIMARY KEY,
    "name"         VARCHAR(50)  NOT NULL,
    "provider"     VARCHAR(50)  NOT NULL,
    "url"          VARCHAR(255),
    "api_key"      VARCHAR(255),
    "json_content" JSONB        DEFAULT '{}',
    "settings"     JSONB        DEFAULT '{}',
    "status"       VARCHAR(20)  DEFAULT 'OK'
);

CREATE TABLE "settings_favorites" (
    "id"         SERIAL      UNIQUE PRIMARY KEY,
    "user_id"    INTEGER,
    "route"      VARCHAR(255)
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_form_id ON documents (form_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_locked_by ON documents (locked_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_workflow_id ON documents (workflow_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_customer_status_regdate ON documents (customer_id, status, register_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_supplier_status_regdate ON documents (supplier_id, status, register_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_splitter_batches_customer_form_status_created ON splitter_batches (customer_id, form_id, status, creation_date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_splitter_batches_locked_by ON splitter_batches (locked_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_splitter_documents_batch_status_display ON splitter_documents (batch_id, status, display_order);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_splitter_documents_batch_status_split ON splitter_documents (batch_id, status, split_index DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_splitter_pages_document_status_display ON splitter_pages (document_id, status, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attachments_document_status ON attachments (document_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attachments_batch_status_id ON attachments (batch_id, status, id DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_monitoring_token ON monitoring (token);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_monitoring_module_status_id ON monitoring (module, status, id DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_history_module_submodule_date ON history (history_module, history_submodule, history_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roles_privileges_role_id ON roles_privileges (role_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_form_models_field_form_id ON form_models_field (form_id);

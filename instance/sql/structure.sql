CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(20) UNIQUE NOT NULL,
  "firstname" VARCHAR(255) NOT NULL,
  "lastname" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "enabled" INTEGER DEFAULT 1,
  "status" VARCHAR(5) DEFAULT 'OK',
  "role" INTEGER
);

CREATE TABLE "form_models" (
  "id" SERIAL PRIMARY KEY,
  "label" VARCHAR(50),
  "default" boolean,
  "enabled" boolean
);

CREATE TABLE "form_models_field" (
  "id" SERIAL PRIMARY KEY,
  "form_id" INTEGER,
  "mandatory" boolean,
  "fields" JSONB
);

CREATE TABLE "custom_fields" (
  "id" SERIAL PRIMARY KEY,
  "label" VARCHAR(50),
  "type" VARCHAR(10),
  "module" VARCHAR(8),
  "value" TEXT
);

CREATE TABLE "users_companies" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "company_id" INTEGER
);

CREATE TABLE "adresses" (
  "id" SERIAL PRIMARY KEY,
  "adress1" VARCHAR(255),
  "adress2" VARCHAR(255),
  "postal_code" VARCHAR(10),
  "city" VARCHAR(50),
  "country" VARCHAR(50)
);

CREATE TABLE "roles" (
  "id" SERIAL PRIMARY KEY,
  "label" VARCHAR(10)
);

CREATE TABLE "roles_services" (
  "role_id" INTEGER PRIMARY KEY,
  "service_id" INTEGER
);

CREATE TABLE "accounts" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "type" INTEGER,
  "siret" VARCHAR(20),
  "siren" VARCHAR(20),
  "adress_id" INTEGER,
  "typology" VARCHAR,
  "form_id" INTEGER
);

CREATE TABLE "companies" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255),
  "company_number" INTEGER,
  "accounting_plan" INTEGER,
  "adress_id" INTEGER
);

CREATE TABLE "companies_accounts" (
  "id" SERIAL PRIMARY KEY,
  "company_id" INTEGER,
  "account_id" INTEGER
);

CREATE TABLE "accounts_supplements" (
  "account_id" VARCHAR(20) PRIMARY KEY NOT NULL,
  "invoice_number_position" VARCHAR,
  "invoice_number_page" VARCHAR,
  "invoice_date_page" VARCHAR,
  "vat_positions" JSONB,
  "no_taxes_positions" JSONB,
  "order_number_positions" JSONB,
  "delivery_number_positions" JSONB,
  "footer_page" INTEGER,
  "thirds_page" INTEGER
);

CREATE TABLE "accounts_type" (
  "id" SERIAL PRIMARY KEY,
  "label" VARCHAR(20)
);

CREATE TABLE "accounting_plan" (
  "id" SERIAL PRIMARY KEY,
  "journal_code" VARCHAR(2),
  "journal_lib" VARCHAR(10),
  "ecriture_num" INTEGER,
  "ecriture_date" TIMESTAMP,
  "compte_num" INTEGER,
  "compte_lib" VARCHAR,
  "comp_aux_num" VARCHAR,
  "comp_aux_lib" VARCHAR,
  "piece_ref" VARCHAR,
  "piece_date" TIMESTAMP,
  "ecriture_lib" VARCHAR
);

CREATE TABLE "journals" (
  "id" INTEGER PRIMARY KEY,
  "label" VARCHAR(10)
);

CREATE TABLE "invoices" (
  "id" SERIAL PRIMARY KEY,
  "account_id" INTEGER,
  "vat_number" VARCHAR DEFAULT NULL,
  "vat_number_position" VARCHAR(80),
  "invoice_number" VARCHAR(255),
  "invoice_number_position" VARCHAR(80),
  "invoice_date" TIMESTAMP,
  "invoice_date_position" VARCHAR(80),
  "filename" VARCHAR(255) NOT NULL,
  "path" VARCHAR NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'NEW',
  "full_jpg_filename" VARCHAR(255),
  "tiff_filename" VARCHAR(255),
  "img_width" INTEGER,
  "nb_pages" INTEGER DEFAULT 1,
  "register_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "total_amount" VARCHAR(255),
  "total_amount_position" VARCHAR(80),
  "ht_amounts" JSONB,
  "ht_amounts_positions" JSONB,
  "vat_rates" JSONB,
  "vat_rates_positions" JSONB,
  "footer_page" INTEGER,
  "supplier_page" INTEGER,
  "invoice_number_page" INTEGER,
  "invoice_date_page" INTEGER,
  "locked" INTEGER NOT NULL DEFAULT 0,
  "locked_by" VARCHAR(20),
  "processed" INTEGER DEFAULT 0,
  "original_filename" VARCHAR(255)
);

CREATE TABLE "history" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER,
  "history_type" VARCHAR(20),
  "history_id" INTEGER,
  "history_invoice_id" INTEGER,
  "history_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "history_desc" VARCHAR(255),
  "user_ip" VARCHAR(12)
);

CREATE TABLE "status" (
  "id" VARCHAR(20),
  "label" VARCHAR(200),
  "label_long" VARCHAR(200)
);

CREATE TABLE "splitter_batches" (
  "id" SERIAL PRIMARY KEY,
  "dir_name" VARCHAR,
  "first_page" VARCHAR,
  "image_folder_name" VARCHAR,
  "creation_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "status" VARCHAR DEFAULT 'NEW',
  "page_number" INTEGER
);

CREATE TABLE "splitter_images" (
  "id" SERIAL PRIMARY KEY,
  "batch_name" VARCHAR,
  "image_path" VARCHAR,
  "image_number" INTEGER,
  "status" VARCHAR DEFAULT 'NEW'
);

ALTER TABLE "roles" ADD FOREIGN KEY ("id") REFERENCES "users" ("role");

ALTER TABLE "roles_services" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "status" ADD FOREIGN KEY ("id") REFERENCES "invoices" ("status");

ALTER TABLE "accounts" ADD FOREIGN KEY ("type") REFERENCES "accounts_type" ("id");

ALTER TABLE "accounting_plan" ADD FOREIGN KEY ("id") REFERENCES "companies" ("accounting_plan");

ALTER TABLE "journals" ADD FOREIGN KEY ("id") REFERENCES "accounting_plan" ("journal_code");

ALTER TABLE "accounts" ADD FOREIGN KEY ("id") REFERENCES "accounts_supplements" ("account_id");

ALTER TABLE "companies_accounts" ADD FOREIGN KEY ("company_id") REFERENCES "companies" ("id");

ALTER TABLE "companies_accounts" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "users_companies" ("user_id");

ALTER TABLE "companies" ADD FOREIGN KEY ("id") REFERENCES "users_companies" ("company_id");

ALTER TABLE "adresses" ADD FOREIGN KEY ("id") REFERENCES "accounts" ("adress_id");

ALTER TABLE "adresses" ADD FOREIGN KEY ("id") REFERENCES "companies" ("adress_id");

ALTER TABLE "history" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "form_models" ADD FOREIGN KEY ("id") REFERENCES "accounts" ("form_id");

ALTER TABLE "form_models" ADD FOREIGN KEY ("id") REFERENCES "form_models_field" ("form_id");

ALTER TABLE "accounts" ADD FOREIGN KEY ("id") REFERENCES "invoices" ("account_id");

ALTER TABLE "custom_fields" ADD FOREIGN KEY ("id") REFERENCES "form_models_field" ("fields");

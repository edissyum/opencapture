CREATE TABLE if NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  creation_date DATETIME DATETIME DEFAULT (datetime('now', 'localtime')),
  enabled INTEGER DEFAULT 1,
  status TEXT DEFAULT 'OK'
);

CREATE TABLE if NOT EXISTS suppliers(
    vat_number                 VARCHAR(200) NOT NULL PRIMARY KEY,
    name                       VARCHAR         NOT NULL,
    siret                      VARCHAR(20),
    siren                      VARCHAR(20),
    adress1                    VARCHAR,
    adress2                    VARCHAR,
    postal_code                VARCHAR,
    city                       VARCHAR,
    typology                   VARCHAR,
    invoice_number_position    VARCHAR,
    no_taxes_1_position        VARCHAR,
    no_taxes_2_position        VARCHAR,
    no_taxes_3_position        VARCHAR,
    no_taxes_4_position        VARCHAR,
    order_number_1_position    VARCHAR,
    order_number_2_position    VARCHAR,
    order_number_3_position    VARCHAR,
    order_number_4_position    VARCHAR,
    delivery_number_1_position VARCHAR,
    delivery_number_2_position VARCHAR,
    delivery_number_3_position VARCHAR,
    delivery_number_4_position VARCHAR,
    vat_1_position             VARCHAR,
    vat_2_position             VARCHAR,
    vat_3_position             VARCHAR,
    vat_4_position             VARCHAR,
    footer_page                VARCHAR,
    supplier_page              VARCHAR,
    invoice_number_page        VARCHAR,
    invoice_date_page          VARCHAR
);

CREATE TABLE if NOT EXISTS invoices(
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    vat_number               VARCHAR DEFAULT NULL,
    vat_number_position      VARCHAR,
    invoice_number           VARCHAR,
    invoice_number_position  VARCHAR,
    invoice_date             VARCHAR,
    invoice_date_position    VARCHAR,
    date_number              VARCHAR,
    date_number_position     VARCHAR,
    filename                 VARCHAR NOT NULL,
    path                     VARCHAR NOT NULL,
    status                   VARCHAR DEFAULT 'NEW' NOT NULL,
    full_jpg_filename        VARCHAR,
    tiff_filename            VARCHAR,
    img_width                VARCHAR,
    nb_pages                 INTEGER     DEFAULT 1,
    register_date            DATETIME DEFAULT (datetime('now', 'localtime')),
    total_amount             VARCHAR,
    total_amount_position    VARCHAR,
    ht_amount1               VARCHAR,
    ht_amount1_position      VARCHAR,
    vat_rate1                VARCHAR,
    vat_rate1_position       VARCHAR,
    footer_page              VARCHAR,
    supplier_page            VARCHAR,
    invoice_number_page      VARCHAR,
    invoice_date_page        VARCHAR,
    locked                   INTEGER DEFAULT 0 NOT NULL,
    locked_by                VARCHAR(20),
    processed                INTEGER DEFAULT 0,
    original_filename        VARCHAR
);

CREATE TABLE IF NOT EXISTS "status" (
	"id"	        VARCHAR(20),
	"label"	        VARCHAR(200),
	"label_long"	VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS invoices_batch_(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dir_name VARCHAR,
    first_page VARCHAR,
    image_folder_name VARCHAR,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR DEFAULT 'NEW',
    page_number INTEGER
);

CREATE TABLE IF NOT EXISTS image_page_number(
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    batch_name VARCHAR,
    image_path VARCHAR,
    image_number INTEGER,
    status VARCHAR DEFAULT 'NEW'
);

INSERT INTO "status" ("id","label","label_long") VALUES ('NEW','À valider','À valider');
INSERT INTO "status" ("id","label","label_long") VALUES ('END','Cloturée','Facture validée et cloturée');
INSERT INTO "status" ("id","label","label_long") VALUES ('ERR','Erreur','Erreur lors de la qualification');
INSERT INTO "status" ("id","label","label_long") VALUES ('ERR_GED','Erreur','Erreur lors de l''envoi à Maarch');
INSERT INTO "status" ("id","label","label_long") VALUES ('WAIT_SUP','En attente','En attente validation fournisseur');
INSERT INTO "status" ("id","label","label_long") VALUES ('DEL','Supprimée','Supprimée');
INSERT INTO "users" ("id","username","password") VALUES (1,'admin','pbkdf2:sha256:150000$7c8waI7f$c0891ac8e18990db0786d4a49aea8bf7c1ad82796dccd8ae35c12ace7d8ee403');
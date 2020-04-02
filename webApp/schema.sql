CREATE TABLE if NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  creation_date DATETIME DATETIME DEFAULT (datetime('now', 'localtime')),
  enabled INTEGER DEFAULT 1,
  status TEXT DEFAULT 'OK'
);

CREATE TABLE if NOT EXISTS suppliers(
    vatNumber                 VARCHAR(200) NOT NULL PRIMARY KEY,
    name                      TEXT         NOT NULL,
    SIRET                     VARCHAR(20),
    SIREN                     VARCHAR(20),
    adress1                   TEXT,
    adress2                   TEXT,
    postal_code               INTEGER,
    city                      TEXT,
    invoiceNumber_position    TEXT,
    noTaxes_1_position        TEXT,
    noTaxes_2_position        TEXT,
    noTaxes_3_position        TEXT,
    noTaxes_4_position        TEXT,
    orderNumber_1_position    TEXT,
    orderNumber_2_position    TEXT,
    orderNumber_3_position    TEXT,
    orderNumber_4_position    TEXT,
    deliveryNumber_1_position TEXT,
    deliveryNumber_2_position TEXT,
    deliveryNumber_3_position TEXT,
    deliveryNumber_4_position TEXT,
    VAT_1_position            TEXT,
    VAT_2_position            TEXT,
    VAT_3_position            TEXT,
    VAT_4_position            TEXT
);

CREATE TABLE if NOT EXISTS invoices(
    vatNumber               TEXT DEFAULT NULL,
    invoiceNumber           VARCHAR,
    invoiceNumber_position  TEXT,
    invoiceDate             VARCHAR,
    invoiceDate_position    TEXT,
    dateNumber              VARCHAR,
    dateNumber_position     TEXT,
    filename                TEXT NOT NULL,
    path                    TEXT NOT NULL,
    thumbPath               TEXT NOT NULL,
    thumbFilename           TEXT NOT NULL,
    status                  VARCHAR DEFAULT 'NEW' NOT NULL,
    fullJpgPath             TEXT,
    fullJpgFilename         TEXT,
    vatNumber_position      TEXT,
    imgWidth                TEXT,
    nbPages                 INTEGER     DEFAULT 1,
    registerDate            DATETIME DEFAULT (datetime('now', 'localtime')),
    HTAmount1               VARCHAR,
    HTAmount1_position      TEXT,
    VATRate1                VARCHAR,
    VATRate1_position       TEXT,
    locked                  INTEGER DEFAULT 0 NOT NULL,
    locked_by               VARCHAR(20),
    processed               INTEGER DEFAULT 0
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
    ceation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

INSERT INTO "user" ("id","username","password") VALUES (1,'admin','pbkdf2:sha256:150000$7c8waI7f$c0891ac8e18990db0786d4a49aea8bf7c1ad82796dccd8ae35c12ace7d8ee403');
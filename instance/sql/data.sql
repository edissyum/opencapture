-- CREATE ROLES
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (1, 'superadmin', 'SuperUtilisateur', 'false');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (2, 'admin', 'Administrateur', 'true');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (3, 'user', 'Utilisateur', 'true');

-- CREATE PRIVILEGES
INSERT INTO "privileges" ("id", "label") VALUES (1, 'administration');
INSERT INTO "privileges" ("id", "label") VALUES (2, 'accounts_list');
INSERT INTO "privileges" ("id", "label") VALUES (3, 'users_list');
INSERT INTO "privileges" ("id", "label") VALUES (4, 'add_user');
INSERT INTO "privileges" ("id", "label") VALUES (5, 'dashboard');
INSERT INTO "privileges" ("id", "label") VALUES (6, 'verifier');
INSERT INTO "privileges" ("id", "label") VALUES (7, 'splitter');
INSERT INTO "privileges" ("id", "label") VALUES (8, 'verifier_upload');
INSERT INTO "privileges" ("id", "label") VALUES (9, 'splitter_upload');

-- ADD PRIVILEGES TO ROLES
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (1, '{"data" : "[''*'']"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (2, '{"data" : "[1, 2, 3, 4, 5, 6, 7, 8, 9]"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (3, '{"data" : "[1, 2, 3, 4, 5, 6, 7, 8, 9]"}');

-- CREATE SUPERADMIN user
INSERT INTO "users" ("username","firstname", "lastname","password", "role") VALUES ('admin', 'Super', 'ADMIN', 'pbkdf2:sha256:150000$7c8waI7f$c0891ac8e18990db0786d4a49aea8bf7c1ad82796dccd8ae35c12ace7d8ee403', 1);
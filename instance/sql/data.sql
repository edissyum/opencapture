-- CREATE ROLES
-- CREATE ROLES
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (1, 'superadmin', 'SuperUtilisateur', 'false');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (2, 'admin', 'Administrateur', 'true');
INSERT INTO "roles" ("id", "label_short", "label", "editable") VALUES (3, 'user', 'Utilisateur', 'true');

-- CREATE PRIVILEGES
INSERT INTO "privileges" ("id", "label", "parent") VALUES (1, 'verifier', 'general');
INSERT INTO "privileges" ("id", "label", "parent") VALUES (2, 'splitter', 'general');
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

-- ADD PRIVILEGES TO ROLES
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (1, '{"data" : "[''*'']"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (2, '{"data" : "[1, 2, 3, 4, 5, 6, 7, 8, 9]"}');
INSERT INTO "roles_privileges" ("role_id", "privileges_id") VALUES (3, '{"data" : "[2, 3, 6, 7, 8, 9]"}');

-- CREATE SUPERADMIN user
INSERT INTO "users" ("username","firstname", "lastname","password", "role") VALUES ('admin', 'Super', 'ADMIN', 'pbkdf2:sha256:150000$7c8waI7f$c0891ac8e18990db0786d4a49aea8bf7c1ad82796dccd8ae35c12ace7d8ee403', 1);
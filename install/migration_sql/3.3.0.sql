ALTER TABLE users ADD COLUMN "refresh_token" TEXT;
INSERT INTO "configurations" ("label", "data") VALUES ('verifierOrderSearch', '{"type": "list", "value": "desc", "options": ["asc", "desc"], "description": "Choix de l''ordre de recherche des informations dans le module Verifier"}');

ALTER TABLE accounts_supplier DROP COLUMN lang;

INSERT INTO "outputs_types" ("output_type_id", "output_type_label", "module", "data") VALUES ('export_coog', 'Export vers COOG', 'verifier', '{
	"options": {
        "auth": [
            {
                "id": "host",
                "type": "text",
                "label": "URL de l''hôte",
                "required": "true",
                "placeholder": "https://coog.edissyum-dev.com/gateway"
            },
            {
                "id": "token",
                "type": "text",
                "label": "Token d''authentification",
                "required": "true",
                "placeholder": "ujx8ke67izyc6q3vvh96520a96a54frgjrpgl85kk4sb0tv3"
            },
            {
                "id": "access_token",
                "type": "text",
                "label": "Token d''accès à l''API",
                "required": "false",
                "placeholder": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            }
        ],
        "parameters": [
            {
                "id": "body_template",
                "hint": "Format JSON avec les identifiants techniques des champs, séparés par #. Si l''identifiant technique n''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "type": "textarea",
                "label": "Contenu de l''appel API",
                "required": true,
                "placeholder": "[{\n\t\"ref\": \"invoice_number\",\n\t\"state\": \"draft\",\n\t\"activity_field\": {\"code\": \"sinistres\"},\n\t\"reception_channel\": {\"code\": \"client\"}\n}]"
            }
        ]
    }
}');

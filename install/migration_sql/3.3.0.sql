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
                "placeholder": "VOTRE_JETON"
            }
        ]
    }
}');

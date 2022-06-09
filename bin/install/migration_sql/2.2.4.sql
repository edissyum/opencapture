-- Add the feature to select specific language for a supplier
ALTER TABLE "accounts_supplier" ADD COLUMN "document_lang" VARCHAR(10) DEFAULT 'fra';

-- Improve supplier detection using email adress
ALTER TABLE "accounts_supplier" ADD COLUMN "email" VARCHAR UNIQUE;
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('emailRegex', 'fra', 'Adresse email', '([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.(fr|com|org|eu))+');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('emailRegex', 'eng', 'Adresse email', '([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.(fr|com|org|eu))+');

-- Improve export_maarch output in verifier
UPDATE outputs_types SET "data" = '{
    "options": {
        "auth": [
            {
                "id": "host",
                "type": "text",
                "label": "URL de l''''hôte",
                "required": "true",
                "placeholder": "http://localhost/maarch_courrier/rest/"
            },
            {
                "id": "login",
                "type": "text",
                "label": "Pseudo de l''''utilisateur WS",
                "required": "true",
                "placeholder": "edissyumws"
            },
            {
                "id": "password",
                "type": "password",
                "label": "Mot de passe de l''''utilisateur WS",
                "required": "true",
                "placeholder": "maarch"
            }
        ],
        "links": [
            {
                "id": "enabled",
                "type": "boolean",
                "label": "Activer la liaison avec un document dans Maarch",
                "required": "true",
                "webservice": "",
                "placeholder": ""
            },
            {
                "id": "maarchCustomField",
                "type": "text",
                "label": "Champ personnalisé à récupérer",
                "required": "false",
                "webservice": "getCustomFieldsFromMaarch",
                "placeholder": "Numéro de devis",
                "hint": "Champ personnalisé Maarch dans lequel est stocké la donnée nécessaire à la liaison avec un document"
            },
            {
                "id": "openCaptureField",
                "type": "text",
                "label": "Champ à comparer dans Open-Capture",
                "required": "false",
                "webservice": "",
                "placeholder": "quotation_number",
                "hint": "Identifiant du champ dans Open-Capture"
            },
            {
                "id": "maarchClause",
                "type": "text",
                "label": "Clause de selection des documents dans Maarch",
                "required": "false",
                "webservice": "",
                "placeholder": "status <> ''END''",
                "hint": ""
            },
            {
                "id": "vatNumberContactCustom",
                "type": "text",
                "label": "Identifiant du champ personnalisé de contact où stocker le numéro de TVA + SIRET",
                "required": "true",
                "webservice": "getContactsCustomFieldsFromMaarch",
                "placeholder": "Identifiant Open-Capture",
                "hint": "Identifiant du champ personnalisé de contact où stocker le numéro de TVA + SIRET"
            }
        ],
        "parameters": [
            {
                "id": "destUser",
                "type": "text",
                "label": "Utilisateur destinataire",
                "required": "true",
                "webservice": "getUsersFromMaarch",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "status",
                "type": "text",
                "label": "Status",
                "required": "true",
                "webservice": "getStatusesFromMaarch",
                "placeholder": "Courrier à qualifier"
            },
            {
                "id": "subject",
                "type": "textarea",
                "label": "Sujet",
                "hint": "Liste des identifiants techniques des champs, séparés par #. Si l''''identifiant technique n''''existe pas, la valeur sera utilisée comme chaîne de caractères brut",
                "required": "true",
                "placeholder": "Facture n°#invoice_number"
            },
            {
                "id": "typeId",
                "type": "text",
                "label": "Type de document",
                "required": "true",
                "webservice": "getDoctypesFromMaarch",
                "placeholder": "Facture à qualifier"
            },
            {
                "id": "typist",
                "type": "text",
                "label": "Utilisateur Rédacteur",
                "required": "true",
                "webservice": "getUsersFromMaarch",
                "placeholder": "Bernard BLIER"
            },
            {
                "id": "priority",
                "type": "text",
                "label": "Priorité",
                "required": "true",
                "webservice": "getPrioritiesFromMaarch",
                "placeholder": "Normal"
            },
            {
                "id": "format",
                "type": "text",
                "label": "Format",
                "required": "true",
                "placeholder": "pdf"
            },
            {
                "id": "modelId",
                "type": "text",
                "label": "Modèle d''''enregistrement",
                "required": "true",
                "webservice": "getIndexingModelsFromMaarch",
                "placeholder": "Facture"
            },
            {
                "id": "destination",
                "type": "text",
                "label": "Entité destinatrice",
                "required": "true",
                "webservice": "getEntitiesFromMaarch",
                "placeholder": "Service Courrier"
            },
            {
                "id": "customFields",
                "hint": "La valeur doit être de type JSON avec des doubles quotes \". La clé est l''''identifiant du custom Maarch, la valeur est l''''identifiant du champ Open-Capture",
                "type": "textarea",
                "label": "Champs personnalisés",
                "isJson": "true",
                "required": "false",
                "placeholder": "{\"1\": \"invoice_number\", \"2\": \"order_number\"}"
            }
        ]
    }
}' WHERE output_type_id = 'export_maarch' AND module = 'verifier';
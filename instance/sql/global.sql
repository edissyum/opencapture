-- Création des languages
INSERT INTO "languages" ("language_id", "label", "lang_code", "moment_lang_code", "date_format") VALUES ('fr','Francais', 'fra', 'fr-FR', '%d %m %Y');
INSERT INTO "languages" ("language_id", "label", "lang_code", "moment_lang_code", "date_format") VALUES ('en', 'English', 'eng', 'en-GB', '%m %d %Y');

-- Création des regex
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('emailRegex', 'global', 'Adresse email', '([A-Za-z0-9]+[.\-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.(fr|com|org|eu|law))+');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('SIRETRegex', 'global', 'Numéro de SIRET', '[0-9]{14}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('SIRENRegex', 'global', 'Numéro de SIREN', '[0-9]{9}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('IBANRegex', 'global', 'Numéro d''IBAN', '[A-Z]{2}(?:[ ]?[0-9]){18,25}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('VATNumberRegex', 'global', 'Numéro de TVA', '(EU|FR|BE(0)?)[0-9A-Z]{2}[0-9]{7,9}');

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('dateRegex', 'fra', 'Date', '((3[01]|[12][0-9]|0?[1-9])|\d{1}\w{2})\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[/,-\.](1[0-2]|0?[1-9])[/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3))');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('dueDateRegex', 'fra', 'Date d''échance', '((DATE)?\s*(D(''|\s*))?(E|É)CH(É|E)ANCE(\(S\))?\s*:?\s*([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)?\s*(€)?\s*(AU)?\s*|FACTURE\s*(A|À)\s*PAYER\s*AVANT\s*LE\s*(:)?\s*)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('invoiceRegex', 'fra', 'Numéro de facture', '(((?P<r1>NUMERO|N(O|°|º|R.))?\s*(DE)?\s*(FACTURE|PI(E|È)CE|DOCUMENT)(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?)|(FACTURE(/)?(DATE)?)\s*(ACQUIT(T)?(E|É)E)?\s*(:|#){1}).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('deliveryNumberRegex', 'fra', 'Numéro de livraison', '((NUM(E|É)RO|N(O|°|º|R.)?|R(E|É)F(\.)?((E|É)RENCE)?)?\s*(DE)?\s*(BON)?\s*(DE)?\s*(LIVRAISON)|NOTE\s*D('')?ENVOI|(BON|BULLETIN)\s*DE\s*LIVR(\.))\s*:?.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('orderNumberRegex', 'fra', 'Numéro de commande', '(VO(TRE|S)|V\.\/)?\s*(NUM(E|É)RO|N(O|°|º|R.)?|R(E|É)F(\.)?((E|É)RENCE)?)\s*(DE)?\s*((COMMANDE|COM(\.)|CDE|DOCUMENT\s*EXTERNE)\s*(INTERNET|WEB)?)|((COMMANDE|CMDE|CDE)\s*(NUM(E|É)RO|N(O|°|º|R.)))\s*(CLIENT)?\s*:?.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('quotationRegex', 'fra', 'Numéro de devis', '(((?P<r1>NUMERO|N(O|°|º|R.))?\s*(DE)?\s*(DEVIS)(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?|(R(E|É)F(\.)?\s*PROPOSITION\s*COMMERCIALE)|CONTRAT\s*(N(O|°|º|R.)))\s*(:|#){0,1}).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('noRatesRegex', 'fra', 'Montant HT', '(?P<r1>MONTANT\s*(NET)?|(SOUS(-|\s+)?)TOTAL|VAT\s*BASE|VALEUR\s*(BRUTE|POSITIONS|NETTE\s*TOTALE)|IMPOSABLE|TOTAL(S)?\s*DES\s*DIVERS\s*(À|A)\s*VENTILER|PRIX\s*NET\s*(TOTAL)?|TOTAL\s*(ORDRE|NET|INTERM(E|É)DIAIRE)|BASE\s*TOTAL)?\s*(:\s*|EN)?(€|EUROS|EUR|CAD)?\s*(?(r1)()|(\()?((H(\.)?T(\.)?(V(\.)?A(\.)?)?|HORS TVA|(EXCL|BASE)\s*(\.)?\s*TVA|HORS\s*TAXES|TOTAL\s*INTERM(É|E)DIAIRE))(\))?){1}\s*(:)?(€|EUROS|EUR|CAD)?\s*([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR|CAD)?|([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€)?\s*(HT)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('allRatesRegex', 'fra', 'Montant TTC', '(?P<r1>MONTANT|^\s*TOTAL)?\s*(:\s*)?(€|EUROS|EUR|CAD)?\s*(?(r1)()|(T(.)?T(.)?C|\(TVA COMPRISE\)|TVAC|TVA\s*INCLUSE|(MONTANT)?NET\s*(À|A)\s*(PAYER|VERSER))){1}(\s*(À|A)\s*PAYER)?\s*(:|(€|EUROS|EUR|CAD))?\s*([0-9]*(\.?\,?\|?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR|CAD)?');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatRateRegex', 'fra', 'Taux de TVA', '(TVA|%)\s*(5(?:\.|,)5|19(?:\.|,)6|(6|10|12|20)(?:[.,]0{1,3})?)|(5(?:\.|,)5|19(?:\.|,)6|(6|10|12|20)(?:[.,]0{1,3})?)(\s*%)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatAmountRegex', 'fra', 'Montant TVA', '((MONTANT|TOTAL|DONT)\s*TVA(\s*[0-9.,]*\s*%)?(\s*\(SUR\s*FACTURE\s*\))?|TVA\s*[0-9.,]*\s*%|TVA\s*[0-9.,]*\s*%?\s*SUR\s*[0-9.,]*\s*[A-Z\s'']*|%\s*TVA)\s*(€|EUROS|EUR|CAD)?.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatRateList', 'fra', 'Liste des taux de TVA', '[20, 19.6, 10, 5.5, 2.1]');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('formatDate', 'fra', 'Format final de la date', '%d/%m/%Y');

-- CRÉATION DES REGEX
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('dateRegex', 'eng', 'Date', '([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9})\s*(3[01]|[12][0-9]|0?[1-9][\.,-]?)\s*((1|2|3){1}\d{1,3}|(1|2|3))| (((1[0-2]|0?[1-9])|\d{1}\w{2})\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[\/,-\.](3[01]|[12][0-9]|0?[1-9])[\/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3)))');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('dueDateRegex', 'eng', 'Due date', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('invoiceRegex', 'eng', 'Invoice number', '(INVOICE\s*NUMBER\s*(:)?).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('deliveryNumberRegex', 'eng', 'Delivery number', '(DELIVERY\s*NUMBER\s*(:)?).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('orderNumberRegex', 'eng', 'Order number', '(ORDER\s*NUMBER\s*(:)?).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('quotationRegex', 'eng', 'Quotation number', '(QUOT(E|ATION)\s*NUMBER\s*(:)?).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('noRatesRegex', 'eng', 'No rates amount', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('allRatesRegex', 'eng', 'All rates amount', '(?P<r1>TOTAL|^(TOTAL)?\s*AMOUNT(\s*PAID)?)?\s*(:\s*)?(\$|£|€|EUROS|EUR|CAD|USD)?\s*(?(r1)()|(T(.)?T(.)?C|\(VAT\s*INCLUDE(D)?\))){1}\s*(:|(\$|£|€|EUROS|EUR|CAD|USD))?\s*([0-9]*(\.?\,?\|?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(\$|£|€|EUROS|EUR|CAD|USD)?');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatRateRegex', 'eng', 'VAT rate', '(20|5)%\s*(VAT)?');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatAmountRegex', 'eng', 'VAT amount', '(VAT\s*(AMOUNT\s*)?)(\$|£|€|EUROS|EUR|CAD|USD)?\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatRateList', 'eng', 'VAT rate list', '[20, 5,0]');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('formatDate', 'eng', 'Final date format', '%m/%d/%Y');

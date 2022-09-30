-- Languages creation
INSERT INTO "languages" ("language_id", "label", "lang_code", "moment_lang_code", "date_format") VALUES ('fr','Francais', 'fra', 'fr-FR', '%d %m %Y');
INSERT INTO "languages" ("language_id", "label", "lang_code", "moment_lang_code", "date_format") VALUES ('en', 'English', 'eng', 'en-GB', '%m %d %Y');

-- REGEX creation (fra)
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('email', 'global', 'Adresse email', '([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('siret', 'global', 'Numéro de SIRET', '[0-9]{14}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('siren', 'global', 'Numéro de SIREN', '[0-9]{9}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('iban', 'global', 'Numéro d''IBAN', '[A-Z]{2}(?:[ ]?[0-9]){18,25}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vat_number', 'global', 'Numéro de TVA', '(EU|SI|HU|D(K|E)|PL|CHE|(F|H)R|B(E|G)(0)?)[0-9A-Z]{2}[0-9]{6,9}');

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('date', 'fra', 'Date', '((3[01]|[12][0-9]|0?[1-9])|\d{1}\w{2})\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[/,-\.](1[0-2]|0?[1-9])[/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3))');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('due_date', 'fra', 'Date d''échance', '((DATE)?\s*(D(''|\s*))?(E|É)CH(É|E)ANCE(\(S\))?\s*:?\s*([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)?\s*(€)?\s*(AU)?\s*|FACTURE\s*(A|À)\s*PAYER\s*AVANT\s*LE\s*(:)?\s*)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('invoice_number', 'fra', 'Numéro de facture', '(((?P<r1>NUMERO|N(O|°|º|R.))?\s*(DE)?\s*(FACTURE|PI(E|È)CE|DOCUMENT)(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?)|(FACTURE(/)?(DATE)?)\s*(ACQUIT(T)?(E|É)E)?\s*(:|#){1}).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('delivery_number', 'fra', 'Numéro de livraison', '((NUM(E|É)RO|N(O|°|º|R.)?|R(E|É)F(\.)?((E|É)RENCE)?)?\s*(DE)?\s*(BON)?\s*(DE)?\s*(LIVRAISON)|NOTE\s*D('')?ENVOI|(BON|BULLETIN)\s*DE\s*LIVR(\.))\s*:?.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('quotation_number', 'fra', 'Numéro de devis', '(((?P<r1>(NUM(E|É)RO|N(O|°|º|R.)?|R(E|É)F(\.)?((E|É)RENCE)?))?\s*(DE)?\s*(DEVIS|COMMANDE|C(M)?DE|DOCUMENT)\s*(INTERNET|EXTERNE|WEB)?(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?|(R(E|É)F(\.)?\s*PROPOSITION\s*COMMERCIALE)|(CONTRAT|COMMANDE|C(M)?DE)\s*(NUMERO|N(O|°|º|R.)))\s*(:|#){0,1}).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('no_rates', 'fra', 'Montant HT', '(?P<r1>MONTANT\s*(NET)?|(SOUS(-|\s+)?)TOTAL|VAT\s*BASE|VALEUR\s*(BRUTE|POSITIONS|NETTE\s*TOTALE)|IMPOSABLE|TOTAL(S)?\s*DES\s*DIVERS\s*(À|A)\s*VENTILER|PRIX\s*NET\s*(TOTAL)?|TOTAL\s*(ORDRE|NET|INTERM(E|É)DIAIRE)|BASE\s*TOTAL)?\s*(:\s*|EN)?(€|EUROS|EUR|CAD)?\s*(?(r1)()|(\()?((H(\.)?T(\.)?(V(\.)?A(\.)?)?|HORS TVA|(EXCL|BASE)\s*(\.)?\s*TVA|HORS\s*TAXES|TOTAL\s*INTERM(É|E)DIAIRE))(\))?){1}\s*(:)?(€|EUROS|EUR|CAD)?\s*([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR|CAD)?|([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€)?\s*(HT)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('all_rates', 'fra', 'Montant TTC', '(?P<r1>MONTANT|^\s*TOTAL)?\s*(:\s*)?(€|EUROS|EUR|CAD)?\s*(?(r1)()|(T(.)?T(.)?C|\(TVA COMPRISE\)|TVAC|TVA\s*INCLUSE|(MONTANT)?NET\s*(À|A)\s*(PAYER|VERSER))){1}(\s*(À|A)\s*PAYER)?\s*(:|(€|EUROS|EUR|CAD))?\s*([0-9]*(\.?\,?\|?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR|CAD)?');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vat_rate', 'fra', 'Taux de TVA', '(TVA|%)\s*(5(?:\.|,)5|19(?:\.|,)6|(6|10|12|20)(?:[.,]0{1,3})?)|(5(?:\.|,)5|19(?:\.|,)6|(6|10|12|20)(?:[.,]0{1,3})?)(\s*%)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vat_amount', 'fra', 'Montant TVA', '((MONTANT|TOTAL|DONT)\s*TVA(\s*[0-9.,]*\s*%)?(\s*\(SUR\s*FACTURE\s*\))?|TVA\s*[0-9.,]*\s*%|TVA\s*[0-9.,]*\s*%?\s*SUR\s*[0-9.,]*\s*[A-Z\s'']*|%\s*TVA)\s*(€|EUROS|EUR|CAD)?.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vat_rate_list', 'fra', 'Liste des taux de TVA', '[20, 19.6, 10, 5.5, 2.1]');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('format_date', 'fra', 'Format final de la date', '%d/%m/%Y');

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_doc_loop', 'fra', 'Boucle des documents dans la sortie XML du Splitter', '<!-- %BEGIN-DOCUMENT-LOOP -->(.*?)<!-- %END-DOCUMENT-LOOP -->');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_condition', 'fra', 'Condition des balises dans la sortie XML du Splitter', '<!-- %BEGIN-IF(.*?) -->(.*?)<!-- %END-IF -->');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_xml_comment', 'fra', 'Commentaire technique dans la sortie XML du Splitter', '\s?<!--[\s\S\n]*?-->\s');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_empty_line', 'fra', 'Lignes vides dans la sortie XML du Splitter', '^\s*$');

-- REGEX creation (eng)
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('date', 'eng', 'Date', '([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9})\s*(3[01]|[12][0-9]|0?[1-9][\.,-]?)\s*((1|2|3){1}\d{1,3}|(1|2|3))|(((1[0-2]|0?[1-9])|\d{1}\w{2})\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[\/,-\.](3[01]|[12][0-9]|0?[1-9])[\/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3)))');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('due_date', 'eng', 'Due date', 'DUE\s*DATE\s*(:)?\s*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('invoice_number', 'eng', 'Invoice number', '(INVOICE\s*(NUMBER|#)\s*(:)?).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('delivery_number', 'eng', 'Delivery number', '(DELIVERY\s*NUMBER\s*(:)?).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('quotation_number', 'eng', 'Quotation number', '((QUOT(E|ATION)|ORDER)\s*NUMBER\s*(:)?).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('no_rates', 'eng', 'No rates amount', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('all_rates', 'eng', 'All rates amount', '(?P<r1>TOTAL|^(TOTAL)?\s*AMOUNT(\s*PAID)?)?\s*(:\s*)?(\$|£|€|EUROS|EUR|CAD|USD)?\s*(?(r1)()|(T(.)?T(.)?C|\(VAT\s*INCLUDE(D)?\))){1}\s*(:|(\$|£|€|EUROS|EUR|CAD|USD))?\s*([0-9]*(\.?\,?\|?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(\$|£|€|EUROS|EUR|CAD|USD)?');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vat_rate', 'eng', 'VAT rate', '(20|5)%\s*(VAT)?');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vat_amount', 'eng', 'VAT amount', '(VAT\s*(AMOUNT\s*)?)(\$|£|€|EUROS|EUR|CAD|USD)?\s*.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vat_rate_list', 'eng', 'VAT rate list', '[20, 5,0]');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('format_date', 'eng', 'Final date format', '%m/%d/%Y');

INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_doc_loop', 'eng', 'Document loop in Splitter XML output', '<!-- %BEGIN-DOCUMENT-LOOP -->(.*?)<!-- %END-DOCUMENT-LOOP -->');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_condition', 'eng', 'Conditions in Splitter XML output', '<!-- %BEGIN-IF(.*?) -->(.*?)<!-- %END-IF -->');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_xml_comment', 'eng', 'Tech comments in Splitter XML output', '\s?<!--[\s\S\n]*?-->\s');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('splitter_empty_line', 'eng', 'Empty line in Splitter XML output', '^\s*$');

-- CRÉATION DES REGEX
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('dateRegex', 'fra', 'Date', '((3[01]|[12][0-9]|0?[1-9])|\d{1}\w{2})\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[/,-\.](1[0-2]|0?[1-9])[/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3))');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('dueDateRegex', 'fra', 'Date d''échance', '((DATE)?\s*(D(''|\s*))?(E|É)CH(É|E)ANCE(\(S\))?\s*:?\s*([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)?\s*(€)?\s*(AU)?\s*|FACTURE\s*(A|À)\s*PAYER\s*AVANT\s*LE\s*(:)?\s*)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('VATNumberRegex', 'fra', 'Numéro de TVA', '(FR|BE(0)?)[0-9A-Z]{2}[0-9]{7,9}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('invoiceRegex', 'fra', 'Numéro de facture', '(((?P<r1>NUMERO|N(O|°|º|R.))?\s*(DE)?\s*(FACTURE|PI(E|È)CE|DOCUMENT)(\s*:)?\s*(?(r1)()|(NUMERO|N(O|°|º|R.)?))(\s*:)?)|(FACTURE(/)?(DATE)?)\s*(ACQUIT(T)?(E|É)E)?\s*(:|#){1}).*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('deliveryNumberRegex', 'fra', 'Numéro de livraison', '((NUM(E|É)RO|N(O|°|º|R.)?|R(E|É)F(\.)?((E|É)RENCE)?)?\s*(DE)?\s*(BON)?\s*(DE)?\s*(LIVRAISON)|NOTE\s*D('')?ENVOI|(BON|BULLETIN)\s*DE\s*LIVR(\.))\s*:?.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('orderNumberRegex', 'fra', 'Numéro de commande', '(VO(TRE|S)|V\./)?\s*(NUM(E|É)RO|N(O|°|º|R.)?|R(E|É)F(\.)?((E|É)RENCE)?)?\s*(DE)?\s*((COMMANDE|COM(\.)|CDE|DOCUMENT\s*EXTERNE)\s*(INTERNET|WEB)?)\s*(CLIENT)?\s*:?.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('SIRETRegex', 'fra', 'Numéro de SIRET', '[0-9]{14}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('SIRENRegex', 'fra', 'Numéro de SIREN', '[0-9]{9}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('IBANRegex', 'fra', 'Numéro d''IBAN', '(FR\d{25})|(BE\d{14})');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('noRatesRegex', 'fra', 'Montant HT', '(?P<r1>MONTANT\s*(NET)?|(SOUS(-|\s+)?)TOTAL|VAT\s*BASE|VALEUR\s*(BRUTE|POSITIONS|NETTE\s*TOTALE)|IMPOSABLE|PRIX\s*NET\s*(TOTAL)?|TOTAL\s*(ORDRE|NET|INTERM(E|É)DIAIRE)|BASE\s*TOTAL)?\s*(:\s*|EN)?(€|EUROS|EUR)?\s*(?(r1)()|(\()?((H(\.)?T(\.)?(V(\.)?A(\.)?)?|HORS TVA|(EXCL|BASE)\s*(\.)?\s*TVA|HORS\s*TAXES|TOTAL\s*INTERM(É|E)DIAIRE))(\))?){1}\s*(:)?(€|EUROS|EUR)?\s*([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR)?|([0-9]*(\.?\,?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€)?\s*(HT)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('allRatesRegex', 'fra', 'Montant TTC', '(?P<r1>MONTANT|^\s*TOTAL)?\s*(:\s*)?(€|EUROS|EUR)?\s*(?(r1)()|(T(.)?T(.)?C|\(TVA COMPRISE\)|TVAC|TVA\s*INCLUSE)){1}(\s*(À|A)\s*PAYER)?\s*(:|(€|EUROS|EUR))?\s*([0-9]*(\.?\,?\|?\s?)[0-9]+((\.?\,?\s?)[0-9])+|[0-9]+)\s*(€|EUROS|EUR)?');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatRateRegex', 'fra', 'Taux de TVA', '(TVA|%)\s*(5(?:\.|,)5|19(?:\.|,)6|(6|10|12|20)(?:[.,]0{1,3})?)|(5(?:\.|,)5|19(?:\.|,)6|(6|10|12|20)(?:[.,]0{1,3})?)(\s*%)');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatAmountRegex', 'fra', 'Montant TVA', '((MONTANT|TOTAL)\s*TVA(\s*[0-9.,]*\s*%)?|TVA\s*[0-9.,]*\s*%|TVA\s*[0-9.,]*\s*%?\s*SUR\s*[0-9.,]*\s*[A-Z\s'']*|%\s*TVA)\s*(€|EUROS|EUR)?.*');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatRateList', 'fra', 'Liste des taux de TVA', '[20, 19.6, 10, 5.5, 2.1]');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('formatDate', 'fra', 'Format final de la date', '%d/%m/%Y');

-- CRÉATION DES REGEX
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('dateRegex', 'eng', 'Date', '((1[0-2]|0?[1-9])|\d{1}\w{2})\s?([JFMASONDjfmasond][a-zA-Z_À-ÿ\.,-]{2,9}|[/,-\.](3[01]|[12][0-9]|0?[1-9])[/,-\.])\s?((1|2|3){1}\d{1,3}|(1|2|3))');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('dueDateRegex', 'eng', 'Due date', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('VATNumberRegex', 'eng', 'VAT number', '(GB)?([0-9]{9}([0-9]{3})?|[A-Z]{2}[0-9]{3})');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('invoiceRegex', 'eng', 'Invoice number', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('deliveryNumberRegex', 'eng', 'Delivery number', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('orderNumberRegex', 'eng', 'Order number', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('SIRETRegex', 'eng', 'SIRET number', '[0-9]{14}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('SIRENRegex', 'eng', 'SIREN number', '[0-9]{9}');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('IBANRegex', 'eng', 'IBAN number', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('noRatesRegex', 'eng', 'No rates amount', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('allRatesRegex', 'eng', 'All rates amoung', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatRateRegex', 'eng', 'VAT rate', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatAmountRegex', 'eng', 'VAT amount', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('vatRateList', 'eng', 'VAT rate list', '');
INSERT INTO "regex" ("regex_id", "lang", "label", "content") VALUES ('formatDate', 'eng', 'Final date format', '%m-%d-%Y');

-- Improve positions masks
ALTER TABLE positions_masks ADD COLUMN form_id INTEGER;

-- Improve REGEX
UPDATE regex SET content = '(VO(TRE|S)|V\.\/)?\s*(NUM(E|É)RO|N(O|°|º|R.)?|R(E|É)F(\.)?((E|É)RENCE)?)\s*(DE)?\s*((COMMANDE|COM(\.)|CDE|DOCUMENT\s*EXTERNE)\s*(INTERNET|WEB)?)|((COMMANDE|CMDE|CDE)\s*(NUM(E|É)RO|N(O|°|º|R.)))\s*(CLIENT)?\s*:?.*' WHERE lang = 'fra' AND regex_id = 'orderNumberRegex';

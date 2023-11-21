UPDATE workflows SET process = process || '{"convert_function": "pdf2image"}';
UPDATE workflows SET process = process || '{"tesseract_function": "line_box_builder"}';

UPDATE docservers SET path = replace(path, 'bin/data/', 'bin/');
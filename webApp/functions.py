import os
from bin.src.classes.Config import Config as cfg

def get_custom_id():
    custom_file = 'custom/custom.ini'
    if os.path.isfile(custom_file):
        Config = cfg(custom_file)
        for custom in Config.cfg:
            if Config.cfg[custom]['selected'] == 'True':
                path = Config.cfg[custom]['path']
                if os.path.isdir(path):
                    return [custom, path]

def check_python_customized_files(path):
    array_of_import = {}
    for root, dirs, files in os.walk(path):
        for file in files:
            if file.endswith(".py"):
                module = os.path.splitext(file)[0]
                path = os.path.join(root).replace('/','.')
                array_of_import.update({
                    module:{
                        'module': module,
                        'path': path
                    }
                })
    return array_of_import

def retrieve_custom_positions(typology, Config):
    if typology:
        file = Config.cfg['REFERENCIAL']['referencialposition'] + typology + '.ini'
        positions = Config.read_custom_position(file)
        return positions
    return False

def search_custom_positions(data, Ocr, Files, Locale):
    regex = data['regex']
    target = data['target']
    position = data['position']
    if position:
        if Files.isTiff == 'True':
            if target == 'footer':
                target_file = Files.tiffName__footer
            elif target == 'header':
                target_file = Files.tiffName_header
            else:
                target_file = Files.tiffName
        else:
            if target == 'footer':
                target_file = Files.jpgName_footer
            elif target == 'header':
                target_file = Files.jpgName_header
            else:
                target_file = Files.jpgName
        if regex:
            localeList = Locale.get()
            regex = localeList[regex]
        return search(position, regex, Files, Ocr, target_file)

def search_by_positions(supplier, index, Config, Locale, Ocr, Files, target_file):
    if supplier:
        positions = Config.read_position(supplier[2]['typology'], index, Locale)
        if positions:
            return search(positions['position'], positions['regex'], Files, Ocr, target_file)
    else:
        return False, (('', ''), ('', ''))

def search(position, regex, Files, Ocr, target_file):
    positionArray = Ocr.prepare_ocr_on_fly(position)
    data = Files.ocr_on_fly(target_file, positionArray, Ocr, None, regex)
    if not data:
        target_file_improved = Files.improve_image_detection(target_file)
        Files.open_img(target_file_improved)
        data = Files.ocr_on_fly(target_file_improved, positionArray, Ocr, None, regex)
        if data:
            return data.replace('\n', ' '), position
        else:
            data = Files.ocr_on_fly(target_file_improved, positionArray, Ocr, None, regex, True)
            if data:
                return data.replace('\n', ' '), position
            return False, (('', ''), ('', ''))
    else:
        return data.replace('\n', ' '), position
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
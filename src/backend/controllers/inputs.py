# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
import os
import stat
from flask_babel import gettext
from src.backend.import_models import inputs
from src.backend.import_classes import _Config
from src.backend.main import create_classes_from_current_config


def get_inputs(args):
    _vars = create_classes_from_current_config()
    _config = _vars[1]

    _inputs = inputs.get_inputs(args)

    response = {
        "inputs": _inputs
    }
    return response, 200


def update_input(input_id, data):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    _, error = inputs.get_input_by_id({'input_id': input_id})

    if error is None:
        _, error = inputs.update_input({'set': data, 'input_id': input_id})

        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_INPUT_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('UPDATE_INPUT_ERROR'),
            "message": error
        }
        return response, 401


def duplicate_input(input_id):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    input_info, error = inputs.get_input_by_id({'input_id': input_id})
    if error is None:
        args = {
            'module': input_info['module'],
            'input_id': 'copy_' + input_info['input_id'],
            'input_label': gettext('COPY_OF') + ' ' + input_info['input_label'],
            'input_folder': '',
            'default_form_id': input_info['default_form_id'],
            'customer_id': input_info['customer_id'] if input_info['module'] == 'verifier' else None,
            'splitter_method_id': input_info['splitter_method_id'] if 'splitter_method_id' in input_info else False,
            'remove_blank_pages': input_info['remove_blank_pages'] if 'remove_blank_pages' in input_info else False,
            'override_supplier_form': input_info['override_supplier_form'] if 'override_supplier_form' in input_info else False,
        }
        _, error = inputs.create_input({'columns': args})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('DUPLICATE_INPUT_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DUPLICATE_INPUT_ERROR'),
            "message": error
        }
        return response, 401


def create_input(data):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    _columns = {
        'module': data['module'],
        'input_id': data['input_id'],
        'input_label': data['input_label'],
        'input_folder': data['input_folder'],
        'default_form_id': data['default_form_id'],
        'customer_id': data['customer_id'] if data['module'] == 'verifier' else None,
        'splitter_method_id': data['splitter_method_id'] if 'splitter_method_id' in data else False,
        'remove_blank_pages': data['remove_blank_pages'] if 'remove_blank_pages' in data else False,
        'override_supplier_form': data['override_supplier_form'] if 'override_supplier_form' in data else False,
    }

    input_info, error = get_inputs({
        'where': ['module = %s', 'input_id = %s'],
        'data': [data['module'], data['input_id']]
    })
    if input_info['inputs']:
        response = {
            "errors": gettext('CREATE_INPUT_ERROR'),
            "message": gettext('INPUT_ID_ALREADY_EXISTS')
        }
        return response, 401

    input_info, error = get_inputs({
        'where': ['input_folder = %s', 'module = %s'],
        'data': [data['input_folder'], data['module']]
    })
    if input_info['inputs']:
        response = {
            "errors": gettext('CREATE_INPUT_ERROR'),
            "message": gettext('INPUT_FOLDER_ALREADY_EXISTS')
        }
        return response, 401

    res, error = inputs.create_input({'columns': _columns})
    if error is None:
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_INPUT_ERROR'),
            "message": error
        }
        return response, 401


def get_input_by_id(input_id):
    input_info, error = inputs.get_input_by_id({'input_id': input_id})

    if error is None:
        return input_info, 200
    else:
        response = {
            "errors": gettext('GET_INPUT_BY_ID_ERROR'),
            "message": error
        }
        return response, 401


def get_input_by_form_id(form_id):
    input_info, _ = inputs.get_input_by_form_id({'form_id': form_id})

    return input_info, 200


def delete_input(input_id):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    input_info, error = inputs.get_input_by_id({'input_id': input_id})
    if error is None:
        _, error = inputs.update_input({'set': {'status': 'DEL'}, 'input_id': input_id})
        if error is None:
            delete_script_and_incron(input_info)
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_INPUT_ERROR'),
                "message": error
            }
            return response, 401
    else:
        response = {
            "errors": gettext('DELETE_INPUT_ERROR'),
            "message": error
        }
        return response, 401


def delete_script_and_incron(args):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    _docservers = _vars[9]

    folder_script = _docservers['SCRIPTS_PATH'] + args['module'] + '_inputs/'
    script_name = args['input_id'] + '.sh'
    old_script_filename = folder_script + '/' + script_name
    if os.path.isdir(folder_script):
        if os.path.isfile(old_script_filename):
            os.remove(old_script_filename)

    ######
    # REMOVE FS WATCHER CONFIG
    ######
    if os.path.isfile(_cfg.cfg['GLOBAL']['watcherconfig']):
        fs_watcher_config = _Config(_cfg.cfg['GLOBAL']['watcherconfig'], interpolation=False).cfg
        fs_watcher_job = args['module'] + '_' + args['input_id']
        if fs_watcher_job in fs_watcher_config:
            _Config.fswatcher_remove_section(_cfg.cfg['GLOBAL']['watcherconfig'], fs_watcher_job)
        return '', 200
    else:
        response = {
            "errors": gettext('FS_WATCHER_DELETION_ERROR'),
            "message": gettext('FS_WATCHER_CONFIG_DOESNT_EXIST')
        }
        return response, 501


def create_script_and_incron(args):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]
    _docservers = _vars[9]
    folder_script = _docservers['SCRIPTS_PATH'] + '/' + args['module'] + '_inputs/'
    arguments = '-input_id ' + str(args['input_id'])

    ######
    # CREATE SCRIPT
    ######
    if os.path.isdir(folder_script):
        script_name = args['input_id'] + '.sh'
        if os.path.isfile(folder_script + '/script_sample_dont_touch.sh'):
            new_script_filename = folder_script + '/' + script_name
            with open(folder_script + '/script_sample_dont_touch.sh', 'r', encoding='utf-8') as script_sample:
                script_sample_content = script_sample.read()
            with open(new_script_filename, 'w+', encoding='utf-8') as new_script_file:
                for line in script_sample_content.split('\n'):
                    corrected_line = line.replace('§§SCRIPT_NAME§§', script_name.replace('.sh', ''))
                    corrected_line = corrected_line.replace('§§OC_PATH§§', _docservers['PROJECT_PATH'] + '/')
                    corrected_line = corrected_line.replace('"§§ARGUMENTS§§"', arguments)
                    new_script_file.write(corrected_line + '\n')
            os.chmod(new_script_filename, os.stat(new_script_filename).st_mode | stat.S_IEXEC)

            ######
            # CREATE OR UPDATE FS WATCHER CONFIG
            ######

            if not os.path.exists(args['input_folder']):
                try:
                    os.mkdir(args['input_folder'], mode=0o777)
                except PermissionError:
                    response = {
                        "errors": gettext('FS_WATCHER_CREATION_ERROR'),
                        "message": gettext('CAN_NOT_CREATE_FOLDER_PERMISSION_ERROR')
                    }
                    return response, 501

            if os.path.isfile(_cfg.cfg['GLOBAL']['watcherconfig']):
                fs_watcher_config = _Config(_cfg.cfg['GLOBAL']['watcherconfig'], interpolation=False)
                fs_watcher_job = args['module'] + '_' + args['input_id']
                fs_watcher_command = new_script_filename + ' $filename'
                if fs_watcher_job in fs_watcher_config.cfg:
                    _Config.fswatcher_update_command(fs_watcher_config.file, fs_watcher_job, fs_watcher_command, args['input_label'])
                    _Config.fswatcher_update_watch(fs_watcher_config.file, fs_watcher_job, args['input_folder'], args['input_label'])
                else:
                    _Config.fswatcher_add_section(fs_watcher_config.file, fs_watcher_job, fs_watcher_command,
                                                  args['input_folder'], args['input_label'])
                return '', 200
            else:
                response = {
                    "errors": gettext('FS_WATCHER_CREATION_ERROR'),
                    "message": gettext('FS_WATCHER_CONFIG_DOESNT_EXIST')
                }
                return response, 501
        else:
            response = {
                "errors": gettext('SCRIPT_SAMPLE_DOESNT_EXISTS'),
                "message": folder_script + '/script_sample_dont_touch.sh'
            }
            return response, 501
    else:
        response = {
            "errors": gettext('SCRIPT_FOLDER_DOESNT_EXISTS'),
            "message": folder_script
        }
        return response, 501

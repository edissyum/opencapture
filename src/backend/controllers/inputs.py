# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import re
import random
import stat
import subprocess
from flask_babel import gettext
from ..import_models import inputs
from ..main import create_classes_from_current_config


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
    input_info, error = inputs.get_input_by_id({'input_id': input_id})

    if error is None:
        res, error = inputs.update_input({'set': data, 'input_id': input_id})

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


def create_input(data):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    _columns = {
        'input_id': data['input_id'],
        'customer_id': data['customer_id'],
        'input_label': data['input_label'],
        'default_form_id': data['default_form_id'],
        'override_supplier_form': data['override_supplier_form'] if 'override_supplier_form' in data else False,
        'input_folder': data['input_folder'],
        'module': data['module'],
    }

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


def delete_input(input_id):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    input_info, error = inputs.get_input_by_id({'input_id': input_id})
    if error is None:
        res, error = inputs.update_input({'set': {'status': 'DEL'}, 'input_id': input_id})
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

    folder_script = _cfg.cfg['GLOBAL']['scriptspath']
    script_name = args['input_id'] + '.sh'
    old_script_filename = folder_script + '/' + script_name
    if os.path.isdir(folder_script):
        if os.path.isfile(old_script_filename):
            os.remove(old_script_filename)

    process = subprocess.Popen(['incrontab', '-l'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    incron_list, err = process.communicate()
    if not err:
        old_incron = args['input_folder'] + ' IN_CLOSE_WRITE,IN_MOVED_TO ' + old_script_filename + ' $@/$#'
        incron_list = incron_list.decode('UTF-8')
        incron_exist = False
        new_incron_without_old_one = ''
        for incron in incron_list.split('\n'):
            if re.sub('\s+', '', incron) != re.sub('\s+', '', old_incron):
                incron_exist = True
                new_incron_without_old_one += incron + '\n'

        if incron_exist:
            tmp_incron_filename = '/tmp/incron_' + str(random.randint(0, 99999))
            tmp_incron_file = open(tmp_incron_filename, 'w+')
            tmp_incron_file.write(new_incron_without_old_one)
            tmp_incron_file.close()
            subprocess.Popen(['incrontab', tmp_incron_filename], stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def create_script_and_incron(args):
    _vars = create_classes_from_current_config()
    _cfg = _vars[1]

    folder_script = _cfg.cfg['GLOBAL']['scriptspath']
    arguments = '-input_id ' + str(args['input_id'])

    ######
    # CREATE SCRIPT
    ######
    if os.path.isdir(folder_script):
        script_name = args['input_id'] + '.sh'
        if os.path.isfile(folder_script + '/script_sample_dont_touch.sh'):
            script_sample = open(folder_script + '/script_sample_dont_touch.sh', 'r')
            script_sample_content = script_sample.read()
            new_script_filename = folder_script + '/' + script_name
            new_script_file = open(new_script_filename, 'w+')
            for line in script_sample_content.split('\n'):
                corrected_line = line.replace('§§SCRIPT_NAME§§', script_name.replace('.sh', ''))
                corrected_line = corrected_line.replace('§§OC_PATH§§', _cfg.cfg['GLOBAL']['projectpath'] + '/')
                corrected_line = corrected_line.replace('"§§ARGUMENTS§§"', arguments)
                new_script_file.write(corrected_line + '\n')
            script_sample.close()
            new_script_file.close()
            os.chmod(new_script_filename, os.stat(new_script_filename).st_mode | stat.S_IEXEC)

            ######
            # CREATE INCRON
            ######
            process = subprocess.Popen(['incrontab', '-l'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            incron_list, err = process.communicate()

            if not err or 'no table for' in err.decode('UTF-8'):
                new_incron = args['input_folder'] + ' IN_CLOSE_WRITE,IN_MOVED_TO ' + new_script_filename + ' $@/$#'
                incron_list = incron_list.decode('UTF-8')
                incron_exist = False
                for incron in incron_list.split('\n'):
                    if re.sub('\s+', '', incron) == re.sub('\s+', '', new_incron):
                        incron_exist = True

                if not incron_exist:
                    incron_list += '\n' + new_incron
                    tmp_incron_filename = '/tmp/incron_' + str(random.randint(0, 99999))
                    tmp_incron_file = open(tmp_incron_filename, 'w+')
                    tmp_incron_file.write(incron_list)
                    tmp_incron_file.close()
                    subprocess.Popen(['incrontab', tmp_incron_filename], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                return '', 200
            else:
                response = {
                    "errors": gettext('INCRON_CREATION_ERROR'),
                    "message": err.decode('UTF-8')
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

# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import json
import os
import stat
import sys
import traceback
from io import StringIO

from flask import request
from flask_babel import gettext
from pyflakes.scripts import pyflakes

from .. import shared
from ..classes.Config import Config
from ..controllers import user
from ..functions import retrieve_custom_from_url, check_order_by
from ..helpers import get_context_var
from ..models import workflow, history
from ..scripting_functions import check_code


def get_workflows(args):
    _args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': args['offset'] if 'offset' in args else 0,
        'limit': args['limit'] if 'limit' in args else 'ALL',
        'where': ["status <> 'DEL'", "module = %s"],
        'data': [args['module'] if 'module' in args else '']
    }

    if 'filter' in args and args['filter']:
        allowed_filters = ['id', 'workflow_id', 'label']
        check_order, error = check_order_by(args['filter'], args['order'], allowed_filters)
        if not check_order:
            response = {
                "errors": gettext('FILTERS_ERROR'),
                "message": error
            }
            return response, 400
        _args['order_by'] = args['filter']
        if 'order' in args and args['order']:
            _args['order_by'] = [args['filter'] + ' ' + args['order']]
        else:
            _args['order_by'] = [args['filter'] + ' DESC']

    if 'search' in args and args['search']:
        _args['where'].append("(workflow_id ILIKE %s OR label ILIKE %s)")
        _args['data'].extend(['%' + args['search'] + '%', '%' + args['search'] + '%'])

    if 'user_id' in args and args['user_id']:
        user_customers = user.get_customers_by_user_id(args['user_id'])
        if user_customers[1] != 200:
            return user_customers[0], user_customers[1]

        user_customers[0].append(0)

        _args['where'].append(
            "((input->>'customer_id')::INTEGER IS NULL OR (input->>'customer_id')::INTEGER = ANY(%s))")
        _args['data'].append(user_customers[0])

    _workflows = workflow.get_workflows(_args)

    response = {
        "workflows": _workflows
    }
    return response, 200


def verify_input_folder(args):
    if 'input_folder' in args and args['input_folder']:
        if not is_path_allowed(args['input_folder']):
            response = {
                "errors": gettext('WORKFLOW_FOLDER_CREATION_ERROR'),
                "message": gettext('FOLDER_NOT_ALLOWED_ERROR')
            }
            return response, 400
        elif not os.path.exists(args['input_folder']):
            try:
                os.makedirs(args['input_folder'], mode=0o777)
            except (PermissionError, FileNotFoundError, TypeError):
                response = {
                    "errors": gettext('WORKFLOW_FOLDER_CREATION_ERROR'),
                    "message": gettext('CAN_NOT_CREATE_FOLDER_PERMISSION_ERROR')
                }
                return response, 400
        else:
            if not os.access(args['input_folder'], os.W_OK):
                response = {
                    "errors": gettext('WORKFLOW_FOLDER_CREATION_ERROR'),
                    "message": gettext('CAN_NOT_ACCESS_FOLDER_PERMISSION_ERROR')
                }
                return response, 400
        return '', 200
    return '', 400


def get_workflow_by_id(workflow_id):
    workflow_info, error = workflow.get_workflow_by_id({'workflow_id': workflow_id})

    if error is None:
        return workflow_info, 200
    else:
        response = {
            "errors": gettext('GET_WORKFLOW_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def duplicate_workflow(args):
    workflow_info, error = workflow.get_workflow_by_id({'workflow_id': args['workflow_id']})
    if error is None:
        workflow_args = {
            'module': workflow_info['module'],
            'workflow_id': args['workflow_label_short'],
            'label': gettext('COPY_OF') + ' ' + workflow_info['label'],
            'input': json.dumps(workflow_info['input']),
            'process': json.dumps(workflow_info['process']),
            'output': json.dumps(workflow_info['output'])
        }

        _, error = workflow.create_workflow({'columns': workflow_args})
        if error is None:
            history.add_history({
                'module': workflow_info['module'],
                'ip': request.remote_addr,
                'submodule': 'duplicate_workflow',
                'user_info': request.environ['user_info'],
                'desc': gettext('DUPLICATE_WORKFLOW', workflow=workflow_info['label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DUPLICATE_WORKFLOW_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DUPLICATE_WORKFLOW_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def is_path_allowed(input_path):
    docservers = get_context_var('docservers', 9)
    configurations = get_context_var('configuration', 10)

    if 'INPUTS_ALLOWED_PATH' in docservers and input_path:
        if 'restrictInputsPath' in configurations and configurations['restrictInputsPath']:
            return input_path.startswith(docservers['INPUTS_ALLOWED_PATH'])
    return True


def create_workflow(data):
    if not is_path_allowed(data['input']['input_folder']):
        response = {
            "errors": gettext('CREATE_WORKFLOW_ERROR'),
            "message": gettext('NOT_ALLOWED_INPUT_PATH')
        }
        return response, 400

    workflow_info, error = get_workflows({
        'where': ['module = %s', 'workflow_id = %s'],
        'data': [data['module'], data['workflow_id']]
    })

    if workflow_info['workflows']:
        response = {
            "errors": gettext('CREATE_WORKFLOW_ERROR'),
            "message": gettext('WORKFLOW_ID_ALREADY_EXISTS')
        }
        return response, 400

    workflow_info, error = get_workflows({
        'where': ['input_folder = %s', 'module = %s', 'status <> %s'],
        'data': [data['input']['input_folder'], data['module'], 'DEL']
    })
    if workflow_info['workflows']:
        response = {
            "errors": gettext('CREATE_WORKFLOW_ERROR'),
            "message": gettext('INPUT_FOLDER_ALREADY_EXISTS')
        }
        return response, 400

    data['input'] = json.dumps(data['input'])
    data['process'] = json.dumps(data['process'])
    data['output'] = json.dumps(data['output'])

    res, error = workflow.create_workflow({'columns': data})
    if error is None:
        history.add_history({
            'module': data['module'],
            'ip': request.remote_addr,
            'submodule': 'create_workflow',
            'user_info': request.environ['user_info'],
            'desc': gettext('CREATE_WORKFLOW', workflow=data['label'])
        })
        response = {
            "id": res
        }
        return response, 200
    else:
        response = {
            "errors": gettext('CREATE_WORKFLOW_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_workflow(workflow_id, data):
    if not is_path_allowed(data['input']['input_folder']):
        response = {
            "errors": gettext('UPDATE_WORKFLOW_ERROR'),
            "message": gettext('NOT_ALLOWED_INPUT_PATH')
        }
        return response, 400

    workflow_info, error = workflow.get_workflow_by_id({'workflow_id': workflow_id})

    new_input_folder = ''
    input_folder_changed = False
    if workflow_info['input']['input_folder'] != data['input']['input_folder']:
        input_folder_changed = True
        new_input_folder = data['input']['input_folder']

    if error is None:
        if 'input' in data:
            data['input'] = json.dumps(data['input'])
        if 'process' in data:
            data['process'] = json.dumps(data['process'])
        if 'output' in data:
            data['output'] = json.dumps(data['output'])

        _, error = workflow.update_workflow({'set': data, 'workflow_id': workflow_id})
        if error is None:
            if input_folder_changed:
                delete_script_and_incron(workflow_info)

                create_script_and_watcher({
                    'module': data['module'],
                    'workflow_id': data['workflow_id'],
                    'input_folder': new_input_folder,
                    'workflow_label': workflow_info['label'],
                })

            history.add_history({
                'module': workflow_info['module'],
                'ip': request.remote_addr,
                'submodule': 'update_workflow',
                'user_info': request.environ['user_info'],
                'desc': gettext('UPDATE_WORKFLOW', workflow=data['label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_WORKFLOW_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_WORKFLOW_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def delete_workflow(workflow_id):
    workflow_info, error = workflow.get_workflow_by_id({'workflow_id': workflow_id})
    if error is None:
        _, error = workflow.update_workflow({'set': {'status': 'DEL'}, 'workflow_id': workflow_id})
        if error is None:
            delete_script_and_incron(workflow_info)
            history.add_history({
                'module': workflow_info['module'],
                'ip': request.remote_addr,
                'submodule': 'delete_workflow',
                'user_info': request.environ['user_info'],
                'desc': gettext('DELETE_WORKFLOW', workflow=workflow_info['label'])
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_WORKFLOW_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_WORKFLOW_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def create_script_and_watcher(args):
    custom_id = retrieve_custom_from_url(request)

    config = get_context_var('config', 1)
    docservers = get_context_var('docservers', 9)

    folder_script = shared.custom_path + '/bin/scripts/' + args['module'] + '_workflows/'
    arguments = '-workflow_id ' + str(args['workflow_id'])

    ######
    # CREATE SCRIPT
    ######
    if os.path.isdir(folder_script):
        script_name = args['workflow_id'] + '.sh'
        new_script_filename = folder_script + '/' + script_name

        ######
        # CREATE OR UPDATE FS WATCHER CONFIG
        ######
        if not os.path.exists(args['input_folder']):
            try:
                os.mkdir(args['input_folder'], mode=0o777)
            except (PermissionError, FileNotFoundError, TypeError):
                response = {
                    "errors": gettext('FS_WATCHER_CREATION_ERROR'),
                    "message": gettext('CAN_NOT_CREATE_FOLDER_PERMISSION_ERROR')
                }
                return response, 400

        if os.path.isfile(config['GLOBAL']['watcherconfig']):
            fs_watcher_config = Config(config['GLOBAL']['watcherconfig'], interpolation=False)
            fs_watcher_job = args['module'] + '_' + args['workflow_id']
            if custom_id:
                fs_watcher_job += '_' + custom_id
            fs_watcher_command = new_script_filename + ' $filename'
            if fs_watcher_job in fs_watcher_config.cfg:
                Config.fswatcher_update_command(fs_watcher_config.file, fs_watcher_job, fs_watcher_command,
                                                args['workflow_label'])
                Config.fswatcher_update_watch(fs_watcher_config.file, fs_watcher_job, args['input_folder'],
                                              args['workflow_label'])
            else:
                Config.fswatcher_add_section(fs_watcher_config.file, fs_watcher_job, fs_watcher_command,
                                             args['input_folder'], args['workflow_label'])
        else:
            response = {
                "errors": gettext('FS_WATCHER_CREATION_ERROR'),
                "message": gettext('FS_WATCHER_CONFIG_DOESNT_EXIST')
            }
            return response, 400

        if os.path.isfile(folder_script + '/' + script_name):
            return {}, 200

        if os.path.isfile(folder_script + '/script_sample_dont_touch.sh'):
            with open(folder_script + '/script_sample_dont_touch.sh', 'r', encoding='utf-8') as script_sample:
                script_sample_content = script_sample.read()
            with open(new_script_filename, 'w+', encoding='utf-8') as new_script_file:
                for line in script_sample_content.split('\n'):
                    corrected_line = line.replace('§§SCRIPT_NAME§§', script_name.replace('.sh', ''))
                    corrected_line = corrected_line.replace('§§OC_PATH§§', docservers['PROJECT_PATH'] + '/backend/')
                    corrected_line = corrected_line.replace('"§§ARGUMENTS§§"', arguments)
                    corrected_line = corrected_line.replace('§§CUSTOM_ID§§', custom_id)
                    corrected_line = corrected_line.replace('§§LOG_PATH§§', config['GLOBAL']['logfile'])
                    new_script_file.write(corrected_line + '\n')
            os.chmod(new_script_filename, os.stat(new_script_filename).st_mode | stat.S_IEXEC)
            return '', 200
        else:
            response = {
                "errors": gettext('SCRIPT_SAMPLE_DOESNT_EXISTS'),
                "message": folder_script + '/script_sample_dont_touch.sh'
            }
            return response, 400
    else:
        response = {
            "errors": gettext('SCRIPT_FOLDER_DOESNT_EXISTS'),
            "message": folder_script
        }
        return response, 400


def get_workflow_by_form_id(form_id):
    workflow_info, _ = workflow.get_workflow_by_form_id({'form_id': form_id})
    return workflow_info, 200


def delete_script_and_incron(args):
    custom_id = retrieve_custom_from_url(request)
    config = get_context_var('config', 1)

    folder_script = shared.custom_path + '/bin/scripts/' + args['module'] + '_workflows/'
    script_name = args['workflow_id'] + '.sh'
    old_script_filename = folder_script + '/' + script_name
    if os.path.isdir(folder_script) and os.path.isfile(old_script_filename):
        os.remove(old_script_filename)

    ######
    # REMOVE FS WATCHER CONFIG
    ######
    if os.path.isfile(config['GLOBAL']['watcherconfig']):
        fs_watcher_config = Config(config['GLOBAL']['watcherconfig'], interpolation=False).cfg
        fs_watcher_job = args['module'] + '_' + args['workflow_id']
        if custom_id:
            fs_watcher_job += '_' + custom_id

        if fs_watcher_job in fs_watcher_config:
            Config.fswatcher_remove_section(config['GLOBAL']['watcherconfig'], fs_watcher_job)
        return '', 200
    else:
        response = {
            "errors": gettext('FS_WATCHER_DELETION_ERROR'),
            "message": gettext('FS_WATCHER_CONFIG_DOESNT_EXIST')
        }
        return response, 501


def test_script(args):
    docservers = get_context_var('docservers', 9)

    try:
        check_res, message = check_code(args['codeContent'], args['input_folder'], 'verifier', docservers['SHARE_PATH'])
        if not check_res:
            result_str = gettext('SCRIPT_CONTAINS_NOT_ALLOWED_CODE') + ' <strong>(' + message.strip() + ')</strong>'
            return {
                "errors": gettext('BAD_REQUEST'),
                "message": result_str
            }, 400

        result = StringIO()
        sys.stderr = result
        pyflakes.check(args['codeContent'], '')
        result_string = result.getvalue()
        splitted_result = result_string.split(':')

        if len(splitted_result) >= 3:
            result_str = '<strong>' + gettext('LINE') + ' ' + splitted_result[1] + ' ' + \
                         gettext('COLUMN') + ' ' + splitted_result[2] + '</strong> : ' + splitted_result[3]
            return {
                "errors": gettext('BAD_REQUEST'),
                "message": result_str
            }, 400
    except (Exception,):
        return traceback.format_exc(), 400
    return result_string, 200

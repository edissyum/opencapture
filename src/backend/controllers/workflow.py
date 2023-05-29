# This file is part of Open-Capture.

# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import os
import json
import stat
from flask_babel import gettext
from flask import request, g as current_context
from src.backend.import_classes import _Config
from src.backend.import_models import workflow, history
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_workflows(args):
    _args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': args['offset'] if 'offset' in args else 0,
        'limit': args['limit'] if 'limit' in args else 'ALL',
        'where': ["status <> 'DEL'", "module = %s"],
        'data': [args['module'] if 'module' in args else '']
    }

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
                os.mkdir(args['input_folder'], mode=0o777)
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


def get_workflow_by_workflow_id(workflow_id):
    workflow_info, error = workflow.get_workflow_by_workflow_id({'workflow_id': workflow_id})

    if error is None:
        return workflow_info, 200
    else:
        response = {
            "errors": gettext('GET_WORKFLOW_BY_WORKFLOW_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def duplicate_workflow(workflow_id):
    workflow_info, error = workflow.get_workflow_by_id({'workflow_id': workflow_id})
    if error is None:
        args = {
            'module': workflow_info['module'],
            'workflow_id': 'copy_' + workflow_info['workflow_id'],
            'label': gettext('COPY_OF') + ' ' + workflow_info['label'],
            'input': json.dumps(workflow_info['input']),
            'process': json.dumps(workflow_info['process']),
            'separation': json.dumps(workflow_info['separation']),
            'output': json.dumps(workflow_info['output'])
        }

        _, error = workflow.create_workflow({'columns': args})
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
    custom_id = retrieve_custom_from_url(request)
    if 'docservers' in current_context and 'configuration' in current_context:
        docservers = current_context.docservers
        configurations = current_context.configuration
    else:
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        configurations = _vars[10]

    if 'INPUTS_ALLOWED_PATH' in docservers and input_path and 'restrictInputsPath' in configurations and configurations['restrictInputsPath']:
        return input_path.startswith(docservers['INPUTS_ALLOWED_PATH'])
    else:
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
    data['separation'] = json.dumps(data['separation'])
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

    if error is None:
        if 'input' in data:
            data['input'] = json.dumps(data['input'])
        if 'process' in data:
            data['process'] = json.dumps(data['process'])
        if 'separation' in data:
            data['separation'] = json.dumps(data['separation'])
        if 'output' in data:
            data['output'] = json.dumps(data['output'])

        _, error = workflow.update_workflow({'set': data, 'workflow_id': workflow_id})

        if error is None:
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
    if 'docservers' in current_context and 'config' in current_context:
        docservers = current_context.docservers
        config = current_context.config
    else:
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        config = _vars[1]

    folder_script = docservers['SCRIPTS_PATH'] + '/' + args['module'] + '_workflows/'
    arguments = '-workflow_id ' + str(args['workflow_id'])

    ######
    # CREATE SCRIPT
    ######
    if os.path.isdir(folder_script):
        script_name = args['workflow_id'] + '.sh'
        if os.path.isfile(folder_script + '/script_sample_dont_touch.sh'):
            new_script_filename = folder_script + '/' + script_name
            with open(folder_script + '/script_sample_dont_touch.sh', 'r', encoding='utf-8') as script_sample:
                script_sample_content = script_sample.read()
            with open(new_script_filename, 'w+', encoding='utf-8') as new_script_file:
                for line in script_sample_content.split('\n'):
                    corrected_line = line.replace('§§SCRIPT_NAME§§', script_name.replace('.sh', ''))
                    corrected_line = corrected_line.replace('§§OC_PATH§§', docservers['PROJECT_PATH'] + '/')
                    corrected_line = corrected_line.replace('"§§ARGUMENTS§§"', arguments)
                    corrected_line = corrected_line.replace('§§CUSTOM_ID§§', custom_id)
                    corrected_line = corrected_line.replace('§§LOG_PATH§§', config['GLOBAL']['logfile'])
                    new_script_file.write(corrected_line + '\n')
            os.chmod(new_script_filename, os.stat(new_script_filename).st_mode | stat.S_IEXEC)

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
                fs_watcher_config = _Config(config['GLOBAL']['watcherconfig'], interpolation=False)
                fs_watcher_job = args['module'] + '_' + args['workflow_id']
                if custom_id:
                    fs_watcher_job += '_' + custom_id
                fs_watcher_command = new_script_filename + ' $filename'
                if fs_watcher_job in fs_watcher_config.cfg:
                    _Config.fswatcher_update_command(fs_watcher_config.file, fs_watcher_job, fs_watcher_command,
                                                     args['workflow_label'])
                    _Config.fswatcher_update_watch(fs_watcher_config.file, fs_watcher_job, args['input_folder'],
                                                   args['workflow_label'])
                else:
                    _Config.fswatcher_add_section(fs_watcher_config.file, fs_watcher_job, fs_watcher_command,
                                                  args['input_folder'], args['workflow_label'])
                return '', 200
            else:
                response = {
                    "errors": gettext('FS_WATCHER_CREATION_ERROR'),
                    "message": gettext('FS_WATCHER_CONFIG_DOESNT_EXIST')
                }
                return response, 400
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
    if 'docservers' in current_context and 'config' in current_context:
        docservers = current_context.docservers
        config = current_context.config
    else:
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]
        config = _vars[1]

    folder_script = docservers['SCRIPTS_PATH'] + args['module'] + '_workflows/'
    script_name = args['workflow_id'] + '.sh'
    old_script_filename = folder_script + '/' + script_name
    if os.path.isdir(folder_script):
        if os.path.isfile(old_script_filename):
            os.remove(old_script_filename)

    ######
    # REMOVE FS WATCHER CONFIG
    ######
    if os.path.isfile(config['GLOBAL']['watcherconfig']):
        fs_watcher_config = _Config(config['GLOBAL']['watcherconfig'], interpolation=False).cfg
        fs_watcher_job = args['module'] + '_' + args['workflow_id']
        if custom_id:
            fs_watcher_job += '_' + custom_id
        if fs_watcher_job in fs_watcher_config:
            _Config.fswatcher_remove_section(config['GLOBAL']['watcherconfig'], fs_watcher_job)
        return '', 200
    else:
        response = {
            "errors": gettext('FS_WATCHER_DELETION_ERROR'),
            "message": gettext('FS_WATCHER_CONFIG_DOESNT_EXIST')
        }
        return response, 501

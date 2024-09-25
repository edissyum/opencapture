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

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import os
import re
import json
import uuid
import shutil
import traceback
import importlib

from flask_babel import gettext
from src.backend.main import launch, create_classes_from_custom_id


def check_code(code, docserver_path, input_path):
    for line in code.split('\n'):
        if line:
            not_allowed = ['import subprocess', 'from subprocess', ', subprocess', ',subprocess', 'sys.modules',
                           'shutil.rmtree', 'shutil.rmdir', 'shutil.rmdirs', 'database.select', 'database.update',
                           'database.insert', 'os.rmtree', 'os.rmdir', 'os.rmdirs', 'os.system()', 'os.system',
                           'eval(', 'exec(', 'import requests', 'from requests', ', requests', ',requests', 'urllib',
                           'import curl', 'curl', 'chr(', 'chdir(']
            if [_na for _na in not_allowed if _na in line.lower()]:
                return False, line

            if not line.startswith('#'):
                directory_path = re.findall("((?:/|\.{1,2}/)[a-zA-Z\./]*[\s]?)", re.sub(r'\s*', '', line))
                if directory_path:
                    for path in directory_path:
                        if not os.path.isdir(path):
                            return False, line
                        if path:
                            current_dir = os.getcwd()
                            path_to_access = re.sub(r'(/){2,}', '/', path)
                            docserver_path = re.sub(r'(/){2,}', '/', docserver_path)
                            if not path_to_access.startswith(docserver_path) and not path_to_access.startswith(input_path):
                                return False, line

                            path_to_access = os.path.dirname(path_to_access)
                            try:
                                os.chdir(path_to_access)
                            except FileNotFoundError:
                                return False, line
                            new_dir = os.getcwd() + '/'

                            if docserver_path not in new_dir and input_path not in new_dir:
                                try:
                                    os.chdir(current_dir)
                                except FileNotFoundError:
                                    return False, line
                                return False, line
                            os.chdir(current_dir)
    return True, ''


def send_to_workflow(args):
    database = create_classes_from_custom_id(args['custom_id'], True)[0]
    workflow = database.select({
        'select': ['input'],
        'table': ['workflows'],
        'where': ['workflow_id = %s'],
        'data': [args['workflow_id']]
    })

    if not workflow:
        args['log'].error(gettext('WORFKLOW_NOT_FOUND'))
        return False

    new_file_name = args['file'].replace('.pdf', '_copy.pdf')
    shutil.copy(args['file'], new_file_name)
    launch({
        'ip': args['ip'],
        'file': new_file_name,
        'user_info': args['user_info'],
        'custom_id': args['custom_id'],
        'workflow_id': args['workflow_id'],
        'current_step': args['log'].current_step,
        'task_id_monitor': args['log'].task_id_monitor
    })

    if os.path.isfile(args['file']):
        os.remove(args['file'])


def update_document_data(args):
    database = create_classes_from_custom_id(args['custom_id'], True)[0]
    if 'document_id' in args and args['document_id']:
        datas = database.select({
            'select': ['datas'],
            'table': ['documents'],
            'where': ['id = %s'],
            'data': [args['document_id']]
        })
        if datas and datas[0]:
            datas = datas[0]['datas']

            for new_data in args['data']:
                datas[new_data] = args['data'][new_data]

            database.update({
                'table': ['documents'],
                'set': {
                    'datas': json.dumps(datas)
                },
                'where': ['id = %s'],
                'data': [args['document_id']]
            })
    elif 'batches_id' in args and args['batches_id']:
        for batch_id in args['batches_id']:
            datas = database.select({
                'select': ["data"],
                'table': ['splitter_batches'],
                'where': ['id = %s'],
                'data': [batch_id]
            })
            if datas and datas[0]:
                datas = datas[0]['data']

                for new_data in args['data']:
                    datas['custom_fields'][new_data] = args['data'][new_data]

                database.update({
                    'table': ['splitter_batches'],
                    'set': {
                        'data': json.dumps(datas)
                    },
                    'where': ['id = %s'],
                    'data': [batch_id]
                })


def launch_script_splitter(workflow_settings, docservers, step, log, database, args, config, datas=None):
    if 'script' in workflow_settings[step] and workflow_settings[step]['script']:
        script = workflow_settings[step]['script']
        check_res, message = check_code(script, docservers['SPLITTER_SHARE'],
                                        workflow_settings['input']['input_folder'])

        if not check_res:
            log.error('[' + step.upper() + '_SCRIPT ERROR] ' + gettext('SCRIPT_CONTAINS_NOT_ALLOWED_CODE') +
                      '&nbsp;<strong>(' + message.strip() + ')</strong>')
            return False

        change_workflow = 'send_to_workflow({' in script

        rand = str(uuid.uuid4())
        tmp_file = docservers['TMP_PATH'] + '/' + step + '_scripting_' + rand + '.py'

        try:
            with open(tmp_file, 'w', encoding='utf-8') as python_script:
                python_script.write(script)

            if os.path.isfile(tmp_file):
                script_name = tmp_file.replace(config['GLOBAL']['applicationpath'], '').replace('/', '.').replace('.py', '')
                script_name = script_name.replace('..', '.')
                try:
                    tmp_script_name = script_name.replace('custom.', '')
                    scripting = importlib.import_module(tmp_script_name, 'custom')
                    script_name = tmp_script_name
                except ModuleNotFoundError:
                    scripting = importlib.import_module(script_name, 'custom')

                batch = database.select({
                    'select': ['file_path'],
                    'table': ['splitter_batches'],
                    'where': ['id = %s'],
                    'data': [args['batches_id'][0]]
                })
                file_path = docservers['SPLITTER_ORIGINAL_DOC'] + "/" + batch[0]['file_path']

                data = {
                    'log': log,
                    'file': file_path,
                    'custom_id': args['custom_id'],
                    'opencapture_path': config['GLOBAL']['applicationpath']
                }

                if step == 'input':
                    data['ip'] = args['ip']
                    data['database'] = database
                    data['user_info'] = args['user_info']
                elif step == 'process':
                    data['batches_id'] = args['batches_id']
                    if datas:
                        data['datas'] = datas
                elif step == 'output':
                    data['batch_id'] = args['batch_id']

                    if datas:
                        data['datas'] = datas

                    if 'outputs' in args:
                        data['outputs'] = args['outputs']

                res = scripting.main(data)
                os.remove(tmp_file)
                return change_workflow and res != 'DISABLED'
        except (Exception,):
           log.error('Error during ' + step + ' scripting : ' + str(traceback.format_exc()))
           os.remove(tmp_file)

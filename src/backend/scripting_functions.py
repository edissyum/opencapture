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
import shutil
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

            # if 'os.remove' in line.lower() or 'shutil.move' in line.lower() or 'shutil.copy' in line.lower() or \
            #    'sys.path.append' in line.lower() or 'open(' in line.lower():
            #     current_dir = os.getcwd()
            #     if 'os.remove' in line:
            #         path_to_access = line.split('os.remove(')[1].split(')')[0].replace("'", '').replace('"', '')
            #         path_to_access = path_to_access.replace(' ', '').strip()
            #     elif 'shutil.move' in line:
            #         path_to_access = line.split('shutil.move(')[1].split(',')[1].replace(")", '').replace("'", '')
            #         path_to_access = path_to_access.replace('"', '').replace(' ', '').strip()
            #     elif 'shutil.copy' in line:
            #         path_to_access = line.split('shutil.copy(')[1].split(',')[1].replace(")", '').replace("'", '')
            #         path_to_access = path_to_access.replace('"', '').replace(' ', '').strip()
            #     elif 'sys.path.append' in line:
            #         path_to_access = line.split('sys.path.append(')[1].split'()')[0].replace("'", '').replace('"', '')
            #         path_to_access = path_to_access.replace('"', '').replace(' ', '').strip()
            #     elif 'open(' in line:
            #         path_to_access = line.split('open(')[1].split(')')[0].replace("'", '').replace('"', '')
            #         path_to_access = path_to_access.replace(' ', '').strip()
            #     else:
            #         return True, ''

                # current_dir = os.getcwd()
                # path_to_access = re.sub(r'(/){2,}', '/', path_to_access)
                # docserver_path = re.sub(r'(/){2,}', '/', docserver_path)
                # if not path_to_access.startswith(docserver_path) and not path_to_access.startswith(input_path):
                #     return False, line
                #
                # path_to_access = os.path.dirname(path_to_access)
                # try:
                #     os.chdir(path_to_access)
                # except FileNotFoundError:
                #     return False, line
                # new_dir = os.getcwd() + '/'
                #
                # if docserver_path not in new_dir and input_path not in new_dir:
                #     try:
                #         os.chdir(current_dir)
                #     except FileNotFoundError:
                #         return False, line
                #     return False, line
                # os.chdir(current_dir)
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
    if args['document_id']:
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

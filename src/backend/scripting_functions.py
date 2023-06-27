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
import json
from flask_babel import gettext
from src.backend.main import launch, create_classes_from_custom_id


def check_code(code, application_path, docserver_path):
    for line in code.split('\n'):
        if line:
            if 'import subprocess' in line or 'from subprocess' in line.lower():
                return False, line
            if 'shutil.rmtree' in line or 'shutil.rmdir' in line or 'shutil.rmdirs' in line:
                return False, line
            if 'database.select' in line or 'database.update' in line or 'database.insert' in line:
                return False, line
            if 'os.rmtree' in line or 'os.rmdir' in line or 'os.rmdirs' in line or 'os.system()' in line:
                return False, line

            if 'os.remove' in line or 'shutil.move' in line:
                current_dir = os.getcwd()
                if 'os.remove' in line:
                    path_to_delete = line.split('os.remove(')[1].split(')')[0].replace("'", '').replace('"', '')
                    path_to_delete = path_to_delete.replace(' ', '').strip()
                elif 'shutil.move' in line:
                    path_to_delete = line.split('shutil.move(')[1].split(',')[1].replace(")", '').replace("'", '')
                    path_to_delete = path_to_delete.replace('"', '').replace(' ', '').strip()
                else:
                    return True, ''

                path_to_delete = os.path.dirname(path_to_delete)
                try:
                    os.chdir(path_to_delete)
                except FileNotFoundError:
                    return False, line
                new_dir = os.getcwd() + '/'

                if application_path not in new_dir and docserver_path not in new_dir:
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

    launch({
        'ip': args['ip'],
        'log': args['log'],
        'file': args['file'],
        'user_info': args['user_info'],
        'custom_id': args['custom_id'],
        'workflow_id': args['workflow_id'],
        'task_id_monitor': args['log'].task_id_monitor
    })


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

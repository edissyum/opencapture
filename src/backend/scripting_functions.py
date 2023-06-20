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

import json
from flask_babel import gettext
from src.backend.main import launch, create_classes_from_custom_id


def send_to_workflow(args):
    database, _, _, _, _, _, _, _, _, _, _, _ = create_classes_from_custom_id(args['custom_id'], True)
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
    database, _, _, _, _, _, _, _, _, _, _, _ = create_classes_from_custom_id(args['custom_id'], True)
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

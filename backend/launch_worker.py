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

import os
import sys
import argparse
from src import app
from src.functions import retrieve_config_from_custom_id
from src.main import launch, create_classes_from_custom_id

ap = argparse.ArgumentParser()
ap.add_argument("-f", "--file", required=True, help="Path to file")
ap.add_argument("-c", "--custom-id", required=True, help="Identifier of the custom")
ap.add_argument("-workflow_id", "--workflow_id", required=True, help="Identifier of the workflow chain")
args = vars(ap.parse_args())

if args['file'] is None:
    sys.exit('The file parameter is mandatory')

if not retrieve_config_from_custom_id(args['custom_id']):
    sys.exit('Custom config file couldn\'t be found')

if args['workflow_id'] is None:
    sys.exit('The workflow_id parameter is mandatory')

with app.app_context():
    _vars = create_classes_from_custom_id(args['custom_id'])
    database = _vars[0]

    try:
        args['workflow_id'] = int(args['workflow_id'])
    except ValueError:
        pass

    if not isinstance(args['workflow_id'], int):
        workflow_id = database.select({
            'select': ['id'],
            'table': ['workflows'],
            'where': ['module = %s', 'workflow_id = %s'],
            'data': ['verifier', args['workflow_id']]
        })
    else:
        workflow_id = [{'id': args['workflow_id']}]

    if not workflow_id:
        sys.exit('Workflow not found')

    args['workflow_id'] = workflow_id[0]['id']

    args['source'] = 'fs-watcher'
    args['task_id_monitor'] = database.insert({
        'table': 'monitoring',
        'columns': {
            'status': 'wait',
            'module': 'verifier',
            'filename': os.path.basename(args['file']),
            'workflow_id': args['workflow_id'] if args['workflow_id'] else None,
            'source': 'fs-watcher'
        }
    })

    args['original_filename'] = os.path.basename(args['file'])

    args['user_info'] = 'fs-watcher'
    args['ip'] = '0.0.0.0'
    launch(args)

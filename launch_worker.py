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
import sys
import argparse
from src.backend import app
from src.backend.functions import retrieve_config_from_custom_id
from src.backend.main import launch, create_classes_from_custom_id

ap = argparse.ArgumentParser()
ap.add_argument("-f", "--file", required=True, help="Path to file")
ap.add_argument("-c", "--custom-id", required=True, help="Identifier of the custom")
ap.add_argument("-workflow_id", "--workflow_id", required=False, help="Identifier of the workflow chain")
args = vars(ap.parse_args())

if args['file'] is None:
    sys.exit('The file parameter is mandatory')

if not retrieve_config_from_custom_id(args['custom_id']):
    sys.exit('Custom config file couldn\'t be found')

if args['workflow_id'] is None:
    sys.exit('The  workflow_id parameter is mandatory')

with app.app_context():
    _vars = create_classes_from_custom_id(args['custom_id'])
    database = _vars[0]

    args['source'] = 'cli'
    args['task_id_monitor'] = database.insert({
        'table': 'monitoring',
        'columns': {
            'status': 'wait',
            'module': 'verifier',
            'filename': os.path.basename(args['file']),
            'workflow_id': args['workflow_id'] if args['workflow_id'] else None,
            'source': 'interface'
        }
    })

    args['user_info'] = 'fs-watcher'
    args['ip'] = '0.0.0.0'
    launch(args)

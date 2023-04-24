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
from flask_babel import gettext
from src.backend.main_splitter import launch
from src.backend import create_classes_from_custom_id
from src.backend.functions import retrieve_config_from_custom_id

# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-f", "--file", required=False, help="path to file")
ap.add_argument("-c", "--custom-id", required=True, help="Identifier of the custom")
ap.add_argument("-input_id", "--input_id", required=False, help="Identifier of the input chain")
ap.add_argument("-workflow_id", "--workflow_id", required=False, help="Identifier of the workflow chain")
args = vars(ap.parse_args())

if args['file'] is None:
    sys.exit('The file parameters is mandatory')

if not retrieve_config_from_custom_id(args['custom_id']):
    sys.exit('Custom config file couldn\'t be found')

if args['input_id'] is None and args['workflow_id'] is None:
    sys.exit('The input_id or workflow_id parameter is mandatory')

_vars = create_classes_from_custom_id(args['custom_id'])
database = _vars[0]

args['source'] = 'cli'
args['task_id_monitor'] = database.insert({
    'table': 'monitoring',
    'columns': {
        'status': 'wait',
        'module': 'splitter',
        'filename': os.path.basename(args['file']),
        'input_id': args['input_id'] if args['input_id'] else None,
        'workflow_id': args['workflow_id'] if args['workflow_id'] else None,
        'source': 'interface'
    }
})
launch(args)

message = gettext('FILE_UPLOADED')
if 'input_id' in args and args['input_id']:
    message = gettext('FILE_UPLOADED') + '&nbsp<strong>' + args['input_id'] + '</strong>'
if 'workflow_id' in args and args['workflow_id']:
    message = gettext('FILE_UPLOADED_WORKFLOW') + '&nbsp<strong>' + args['workflow_id'] + '</strong>'

args = {
    'table': 'history',
    'columns': {
        'history_submodule': 'upload_file',
        'history_module': 'splitter',
        'user_info': 'fs-watcher',
        'history_desc': message,
        'user_ip': '0.0.0.0',
    }
}
database.insert(args)

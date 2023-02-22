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

import sys
import argparse
from src.backend import app
from flask_babel import gettext
from src.backend.functions import retrieve_config_from_custom_id
from src.backend.main import launch, create_classes_from_custom_id

ap = argparse.ArgumentParser()
ap.add_argument("-f", "--file", required=True, help="Path to file")
ap.add_argument("-c", "--custom-id", required=True, help="Identifier of the custom")
ap.add_argument("-input_id", "--input_id", required=True, help="Identifier of the input chain")
args = vars(ap.parse_args())

if args['file'] is None:
    sys.exit('The file parameter is mandatory')

if not retrieve_config_from_custom_id(args['custom_id']):
    sys.exit('Custom config file couldn\'t be found')

with app.app_context():
    args['source'] = 'cli'
    launch(args)
    _vars = create_classes_from_custom_id(args['custom_id'])
    database = _vars[0]
    args = {
        'table': 'history',
        'columns': {
            'history_submodule': 'upload_file',
            'history_module': 'verifier',
            'user_info': 'fs-watcher',
            'history_desc': gettext('FILE_UPLOADED') + '&nbsp<strong>' + args['input_id'] + '</strong>',
            'user_ip': '0.0.0.0',
        }
    }
    database.insert(args)

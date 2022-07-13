# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import sys
import argparse
from src.backend import app
from src.backend.main import launch
from src.backend.functions import retrieve_config_from_custom_id

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
    launch(args)

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
from .functions import get_custom_array, retrieve_config_from_custom_id


def launch(args):
    if not retrieve_config_from_custom_id(args['custom_id']):
        sys.exit('Custom config file couldn\'t be found')

    path = retrieve_config_from_custom_id(args['custom_id']).replace('/config/config.ini', '')
    custom_array = get_custom_array([args['custom_id'], path])
    if 'process_queue_splitter' not in custom_array or not custom_array['process_queue_splitter'] and not custom_array['process_queue_splitter']['path']:
        import src.backend.process_queue_splitter as process_queue_splitter
    else:
        custom_array['process_queue_splitter']['path'] = 'custom.' + custom_array['process_queue_splitter']['path'].split('.custom.')[1]
        process_queue_splitter = getattr(__import__(custom_array['process_queue_splitter']['path'],
                                                    fromlist=[custom_array['process_queue_splitter']['module']]),
                                         custom_array['process_queue_splitter']['module'])
    process_queue_splitter.launch(args)

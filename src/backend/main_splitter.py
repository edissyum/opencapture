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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

import sys
from .functions import get_custom_array, retrieve_config_from_custom_id


def launch(args):
    if not retrieve_config_from_custom_id(args['custom_id']):
        sys.exit('Custom config file couldn\'t be found')

    path = retrieve_config_from_custom_id(args['custom_id']).replace('/config/config.ini', '')
    custom_array = get_custom_array([args['custom_id'], path])
    if 'process_queue_splitter' not in custom_array or not custom_array['process_queue_splitter'] and not custom_array['process_queue_splitter']['path']:
        from src.backend import process_queue_splitter
    else:
        custom_array['process_queue_splitter']['path'] = 'custom.' + custom_array['process_queue_splitter']['path'].split('.custom.')[1]
        process_queue_splitter = getattr(__import__(custom_array['process_queue_splitter']['path'],
                                                    fromlist=[custom_array['process_queue_splitter']['module']]),
                                         custom_array['process_queue_splitter']['module'])
    process_queue_splitter.launch(args)

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

from flask import request, g as current_context
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url
from src.backend.classes.OpenCaptureForMEMWebServices import OpenCaptureForMEMWebServices


def get_access_token(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]

    _ws = OpenCaptureForMEMWebServices(
        args['host'],
        args['secret_key'],
        args['custom_id'],
        log
    )
    return _ws.access_token

def get_processes(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]

    _ws = OpenCaptureForMEMWebServices(
        args['host'],
        args['secret_key'],
        args['custom_id'],
        log
    )
    processes = _ws.get_processes()
    return processes

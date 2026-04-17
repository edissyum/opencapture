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

from flask import request, g as current_context
from .functions import retrieve_custom_from_url
from .main import create_classes_from_custom_id

def get_context_var(name: str, index: int, load_smtp=False):
    if name in current_context and getattr(current_context, name) is not None:
        return getattr(current_context, name)
    custom_id = retrieve_custom_from_url(request)
    _vars = create_classes_from_custom_id(custom_id, load_smtp)
    return _vars[index]
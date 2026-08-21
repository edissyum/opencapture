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

import sys
import types

from flask import g

# Declared as plain module attributes purely so static analysis tools (PyCharm, mypy, ...)
# still resolve `shared.custom_id`, `shared.tmp_path`, etc. across the codebase - at runtime
# this module is replaced wholesale by the proxy instance below, which shadows all of this.
tmp_path: str = ''
data_path: str = ''
custom_id: str = ''
error_path: str = ''
assets_path: str = ''
custom_path: str = ''
upload_path: str = ''

_ATTRS = {
    'tmp_path': tmp_path,
    'data_path': data_path,
    'custom_id': custom_id,
    'error_path': error_path,
    'assets_path': assets_path,
    'custom_path': custom_path,
    'upload_path': upload_path
}


class _RequestScopedShared(types.ModuleType):
    """
    This module used to expose plain module-level globals (tmp_path, custom_id, ...),
    reassigned on every request by main.py:init_shared_from_custom_id(). Under a threaded/
    multi-tenant server, two concurrent requests for different tenants could then read each
    other's paths/custom_id (race condition, potential cross-tenant data leak).

    This class keeps the exact same `shared.custom_id`, `shared.tmp_path = ...` access pattern
    used throughout the codebase, but backs it with Flask's per-request `g` instead, so every
    request gets its own isolated values.
    """

    def __getattr__(self, name):
        if name not in _ATTRS:
            raise AttributeError(name)
        try:
            return getattr(g, '_shared_' + name, _ATTRS[name])
        except RuntimeError:
            return _ATTRS[name]

    def __setattr__(self, name, value):
        if name not in _ATTRS:
            super().__setattr__(name, value)
            return
        try:
            setattr(g, '_shared_' + name, value)
        except RuntimeError:
            pass


sys.modules[__name__] = _RequestScopedShared(__name__)

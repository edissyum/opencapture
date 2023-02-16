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

from flask import request, g as current_context
from src.backend.import_classes import _MEMWebServices
from src.backend.main import create_classes_from_custom_id
from src.backend.functions import retrieve_custom_from_url


def test_connection(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    return _ws.status


def get_users(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    users = _ws.retrieve_users()
    return users


def get_doctypes(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    doctypes = _ws.retrieve_doctypes()
    return doctypes


def get_entities(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    entities = _ws.retrieve_entities()
    return entities


def get_custom_fields(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    custom_fields = _ws.retrieve_custom_fields()
    return custom_fields


def get_contact_custom_fields(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    custom_fields = _ws.retrieve_contact_custom_fields()
    return custom_fields


def get_priorities(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    entities = _ws.retrieve_priorities()
    return entities


def get_statuses(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    statuses = _ws.retrieve_statuses()
    return statuses


def retrieve_contact(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    contact = _ws.retrieve_contact(args)
    return contact


def get_document_with_contact(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    contact = _ws.get_document_with_contact(args)
    return contact


def get_indexing_models(args):
    if 'log' in current_context:
        log = current_context.log
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        log = _vars[5]
    _ws = _MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    indexing_models = _ws.retrieve_indexing_models()
    return indexing_models

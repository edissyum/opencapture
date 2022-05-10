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

from src.backend.main import create_classes_from_current_config
from src.backend.import_classes import _MaarchWebServices


def test_connection(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    return _ws.status


def get_users(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    users = _ws.retrieve_users()
    return users


def get_doctypes(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    doctypes = _ws.retrieve_doctypes()
    return doctypes


def get_entities(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    entities = _ws.retrieve_entities()
    return entities


def get_custom_fields(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    custom_fields = _ws.retrieve_custom_fields()
    return custom_fields


def get_contact_custom_fields(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    custom_fields = _ws.retrieve_contact_custom_fields()
    return custom_fields


def get_priorities(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    entities = _ws.retrieve_priorities()
    return entities


def get_statuses(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    statuses = _ws.retrieve_statuses()
    return statuses


def retrieve_contact(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    contact = _ws.retrieve_contact(args)
    return contact


def get_document_with_contact(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    contact = _ws.get_document_with_contact(args)
    return contact


def get_indexing_models(args):
    _vars = create_classes_from_current_config()
    _ws = _MaarchWebServices(
        args['host'],
        args['login'],
        args['password'],
        _vars[5],
        _vars[1]
    )
    indexing_models = _ws.retrieve_indexing_models()
    return indexing_models

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

from ..helpers import get_context_var
from ..classes.MEMWebServices import MEMWebServices


def test_connection(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    return _ws.status


def get_users(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    users = _ws.retrieve_users()
    return users


def get_doctypes(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    doctypes = _ws.retrieve_doctypes()
    return doctypes


def get_entities(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    entities = _ws.retrieve_entities()
    return entities


def get_custom_fields(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    custom_fields = _ws.retrieve_custom_fields()
    return custom_fields


def get_contact_custom_fields(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    custom_fields = _ws.retrieve_contact_custom_fields()
    return custom_fields


def get_priorities(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    entities = _ws.retrieve_priorities()
    return entities


def get_statuses(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    statuses = _ws.retrieve_statuses()
    return statuses


def retrieve_contact(args):
    log = get_context_var('log', 5)

    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    contact = _ws.retrieve_contact(args)
    return contact


def get_document_with_contact(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    contact = _ws.get_document_with_contact(args)
    return contact


def get_indexing_models(args):
    log = get_context_var('log', 5)
    _ws = MEMWebServices(
        args['host'],
        args['login'],
        args['password'],
        log
    )
    indexing_models = _ws.retrieve_indexing_models()
    return indexing_models
